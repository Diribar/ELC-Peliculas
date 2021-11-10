// ************ Requires ************
let fs = require("fs");
let path = require("path");
let axios = require("axios");
let requestPromise = require("request-promise");
let buscar_x_PC = require("../../funciones/Productos/1-Buscar_x_PC");
let procesarProd = require("../../funciones/Productos/2-Procesar");
let validarProd = require("../../funciones/Productos/3-Errores");
let BD_varias = require("../../funciones/BD/varias");

// *********** Controlador ***********
module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "palabrasClave";
		// 2. Data Entry propio y errores
		let palabrasClave = req.session.palabrasClave
			? req.session.palabrasClave
			: req.cookies.palabrasClave
			? req.cookies.palabrasClave
			: "";
		let errores = req.session.errores
			? req.session.errores
			: palabrasClave
			? await validarProd.palabrasClave(palabrasClave)
			: "";
		// 3. Eliminar session y cookie posteriores, si existen
		if (req.cookies.desambiguar) res.clearCookie("desambiguar");
		if (req.cookies.copiarFA) res.clearCookie("copiarFA");
		if (req.session.desambiguar) delete req.session.desambiguar;
		if (req.session.copiarFA) delete req.session.copiarFA;
		// 4. Render del formulario
		//return res.send(req.cookies);
		autorizado_fa = req.session.usuario.autorizado_fa;
		return res.render("Home", {
			tema,
			codigo,
			autorizado_fa,
			link: req.originalUrl,
			palabrasClave,
			errores,
		});
	},

	palabrasClaveGuardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let palabrasClave = req.body.palabrasClave;
		req.session.palabrasClave = palabrasClave;
		res.cookie("palabrasClave", palabrasClave, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2. Si hay errores de validación, redireccionar
		let errores = await validarProd.palabrasClave(palabrasClave);
		if (errores.palabrasClave) {
			req.session.errores = errores;
			return res.redirect("/agregar/productos/palabras-clave");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.desambiguar = await buscar_x_PC.search(palabrasClave);
		res.cookie("desambiguar", req.session.desambiguar, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/desambiguar");
	},

	desambiguarForm: (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "desambiguar";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.session.datosDuros) delete req.session.datosDuros;
		// 3. Eliminar session y cookie de copiarFA, si existen
		if (req.cookies.copiarFA) res.clearCookie("copiarFA");
		if (req.session.copiarFA) delete req.session.copiarFA;
		// 4. Feedback de la instancia anterior
		desambiguar = req.session.desambiguar
			? req.session.desambiguar
			: req.cookies.desambiguar
			? req.cookies.desambiguar
			: "";
		if (!desambiguar)
			return res.redirect("/agregar/productos/palabras-clave");
		// 5. Render del formulario
		//return res.send(req.cookies);
		resultados = desambiguar.resultados;
		coincidencias = resultados.length;
		prod_nuevos = resultados.filter((n) => n.YaEnBD == false);
		prod_yaEnBD = resultados.filter((n) => n.YaEnBD != false);
		return res.render("Home", {
			tema,
			codigo,
			hayMas: desambiguar.hayMas,
			coincidencias,
			prod_nuevos,
			prod_yaEnBD,
			palabrasClave: desambiguar.palabrasClave,
			fuente: desambiguar.fuente,
			link: req.originalUrl,
		});
	},

	desambiguarGuardar: async (req, res) => {
		// 1. Generar la session para la siguiente instancia
		req.session.datosDuros =
			req.body.fuente == "TMDB"
				? await obtenerDatosDelProductoTMDB(req.body)
				: req.body;
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2. Redireccionar a la siguiente instancia
		res.redirect("/agregar/productos/datos-duros");
	},

	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "copiarFA";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.session.datosDuros) delete req.session.datosDuros;
		// 3. Eliminar session y cookie de desambiguar, si existen
		if (req.cookies.desambiguar) res.clearCookie("desambiguar");
		if (req.session.desambiguar) delete req.session.desambiguar;
		// 4. Data Entry propio y errores
		let copiarFA = req.session.copiarFA
			? req.session.copiarFA
			: req.cookies.copiarFA
			? req.cookies.copiarFA
			: "";
		let errores = req.session.errores
			? req.session.errores
			: copiarFA
			? await validarProd.copiarFA(copiarFA)
			: "";
		// 5. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: copiarFA,
			errores,
		});
	},

	copiarFA_Guardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let copiarFA = req.body;
		req.session.copiarFA = copiarFA;
		res.cookie("copiarFA", copiarFA, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProd.copiarFA(copiarFA);
		// 2.2. Averiguar si el FA_id ya está en la BD
		if (!errores.direccion) {
			fa_id = await procesarProd.obtenerFA_id(req.body.direccion);
			entidad =
				copiarFA.rubroAPI == "movie" ? "peliculas" : "colecciones";
			campo = copiarFA.rubroAPI == "movie" ? "peli_fa_id" : "colec_fa_id";
			elc_id = await procesarProd.obtenerELC_id({
				entidad,
				campo,
				valor: fa_id,
			});
			if (elc_id) {
				errores.direccion =
					"El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect("/agregar/productos/copiar-fa");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProd.producto_FA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/datos-duros");
	},

	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosDuros";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosPers) {
			ruta = "./public/imagenes/9-Provisorio/";
			if (req.cookies.datosPers.avatar)
				fs.unlinkSync(ruta + req.cookies.datosPers.avatar);
			res.clearCookie("datosPers");
		}
		if (req.session.datosPers) delete req.session.datosPers;
		// 3. Feedback de la instancia anterior
		datosDuros = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros
			? req.cookies.datosDuros
			: "";
		// 4. Detectar el origen
		origen =
			!!req.session.desambiguar || req.cookies.desambiguar
				? "desambiguar"
				: !!req.session.copiarFA || req.cookies.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!datosDuros) return res.redirect("/agregar/productos/" + origen);
		// 5. GuardarIDdelProducto
		IDdelProducto = datosClaveDelProducto(datosDuros);
		req.session.IDdelProducto = IDdelProducto;
		res.cookie("IDdelProducto", IDdelProducto, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 6. Render del formulario
		//return res.send(req.cookies);
		let errores = req.session.errores
			? req.session.errores
			: await validarProd.datosDuros(datosDuros, camposDD());
		let paises = await BD_varias.obtenerTodos("paises", "nombre");
		let pais = datosDuros.pais_id
			? await varias.pais_idToNombre(datosDuros.pais_id)
			: "";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: datosDuros,
			pais,
			paises,
			errores,
			datos: camposDD(),
		});
	},

	DDG: async (req, res) => {
		// 1. Feedback de la instancia anterior
		aux = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros;
		// 2. Detectar el origen
		origen =
			req.session.desambiguar || req.cookies.desambiguar
				? "desambiguar"
				: req.session.copiarFA || req.cookies.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!aux) return res.redirect("/agregar/productos/" + origen);
		// 3. Guardar el data entry en session y cookie
		let datosDuros = { ...aux, ...req.body };
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Averiguar si hay errores de validación
		let errores = await validarProd.datosDuros(datosDuros, camposDD());
		// 5. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id o el FA_id ya están en la BD
		if (!errores.nombre_original) {
			// Obtener los parámetros
			fuente = datosDuros.fuente.toLowerCase();
			entidad =
				datosDuros.rubroAPI == "movie" ? "peliculas" : "colecciones";
			campo = datosDuros.rubroAPI == "movie" ? "peli" : "colec";
			campo += "_" + fuente + "_id";
			id = datosDuros[campo];
			// Averiguar si hubieron errores
			elc_id = await procesarProd.obtenerELC_id({
				entidad,
				campo,
				valor,
			});
			// Acciones si hubieron errores
			if (elc_id) {
				errores.nombre_original =
					"El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 6. Si aún no hay errores de imagen, revisar el archivo de imagen
		if (!errores.avatar) {
			if (req.file) {
				// En caso de archivo por multer
				tipo = req.file.mimetype;
				tamano = req.file.size;
				nombre = req.file.filename;
				rutaYnombre = req.file.path;
			} else if (datosDuros.avatar) {
				// En caso de archivo sin multer
				let datos = await requestPromise
					.head(datosDuros.avatar)
					.then((n) => [n["content-type"], n["content-length"]]);
				tipo = datos[0];
				tamano = datos[1];
				nombre = Date.now() + path.extname(datosDuros.avatar);
				rutaYnombre = "./public/imagenes/9-Provisorio/" + nombre;
			}
			// Revisar errores
			errores.avatar = revisarImagen(tipo, tamano);
			// Si la imagen venía de TMDB, entonces grabarla
			if (!errores.avatar && !errores.hay && datosDuros.fuente == "TMDB")
				download(datosDuros.avatar, rutaYnombre); // Grabar el archivo de url
			// Si hay errores en el avatar, marcar que sí hay errores
			if (errores.avatar) errores.hay = true;
		}
		// 7. Si hay errores de validación, redireccionar
		if (errores.hay) {
			//return res.send(errores)
			if (fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre); // Borrar el archivo de imagen
			req.session.errores = errores;
			return res.redirect("/agregar/productos/datos-duros");
		}
		// 8. Generar la session para la siguiente instancia
		avatarDP =
			datosDuros.fuente == "TMDB"
				? datosDuros.avatar
				: "/imagenes/9-Provisorio/" + nombre;
		req.session.datosPers = {
			...req.session.datosDuros,
			avatarDP: avatarDP,
			avatar: nombre,
		};
		res.cookie("datosPers", req.session.datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/datos-personalizados");
	},

	datosPersForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosPers";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.confirmar) res.clearCookie("confirmar");
		if (req.session.confirmar) delete req.session.confirmar;
		// 3. Feedback de la instancia anterior o Data Entry propio
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/agregar/productos/datos-duros");
		// 4. GuardarIDdelProducto
		IDdelProducto = datosClaveDelProducto(datosPers);
		req.session.IDdelProducto = IDdelProducto;
		res.cookie("IDdelProducto", IDdelProducto, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 5. Render del formulario
		//return res.send(req.cookies);
		let errores = req.session.errores ? req.session.errores : "";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: datosPers,
			errores,
			datosPers_select: await datosPersSelect(),
			datosPers_input: datosPersInput(),
		});
	},

	datosPersGuardar: async (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers;
		if (!aux) return res.redirect("/agregar/productos/datos-duros");
		// 1.2. Guardar el data entry en session y cookie
		let datosPers = { ...aux, ...req.body };
		if (!datosPers.personaje_historico_id)
			delete datosPers.personaje_historico_id;
		if (!datosPers.hecho_historico_id) delete datosPers.hecho_historico_id;
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		camposDP = [...(await datosPersSelect()), ...datosPersInput()];
		let errores = await validarProd.datosPers(datosPers, camposDP);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect("/agregar/productos/datos-personalizados");
		}
		// 3. Si no hay errores, obtener la calificación
		fe_valores = await BD_varias.obtenerPorParametro(
			"fe_valores",
			"id",
			req.body.fe_valores_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		entretiene = await BD_varias.obtenerPorParametro(
			"entretiene",
			"id",
			req.body.entretiene_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calidad_tecnica = await BD_varias.obtenerPorParametro(
			"calidad_tecnica",
			"id",
			req.body.calidad_tecnica_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calificacion = (
			fe_valores * 0.5 +
			entretiene * 0.3 +
			calidad_tecnica * 0.2
		).toFixed(2);
		// Preparar la info para el siguiente paso
		req.session.confirmar = {
			...req.session.datosPers,
			colec_tmdb_rubro: req.session.datosPers.rubroAPI,
			fe_valores,
			entretiene,
			calidad_tecnica,
			calificacion,
			creada_por_id: req.session.usuario.id,
		};
		res.cookie("confirmar", req.session.confirmar, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/confirmar");
	},

	confirmarForm: (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "confirmar";
		// 2. Feedback de la instancia anterior o Data Entry propio
		confirmar = req.session.confirmar
			? req.session.confirmar
			: req.cookies.confirmar
			? req.cookies.confirmar
			: "";
		if (!confirmar)
			return res.redirect("/agregar/productos/datos-personalizados");
		// 3. GuardarIDdelProducto
		IDdelProducto = datosClaveDelProducto(confirmar);
		req.session.IDdelProducto = IDdelProducto;
		res.cookie("IDdelProducto", IDdelProducto, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: confirmar,
		});
	},

	confirmarGuardar: async (req, res) => {
		// 1. Feedback de la instancia anterior o Data Entry propio
		confirmar = req.session.confirmar
			? req.session.confirmar
			: req.cookies.confirmar
			? req.cookies.confirmar
			: "";
		if (!confirmar)
			return res.redirect("/agregar/productos/datos-personalizados");
		// 2. Guardar el registro
		entidad = confirmar.rubroAPI == "movie" ? "peliculas" : "colecciones";
		registro = await BD_varias.agregarRegistro(entidad, confirmar);
		// 3. Actualizar "cantProductos" en "Relación con la vida"
		actualizarRelacionConLaVida(
			"historicos_personajes",
			registro.personaje_historico_id
		);
		actualizarRelacionConLaVida(
			"historicos_hechos",
			registro.hecho_historico_id
		);
		// Miscelaneas
		guardarCalificaciones_us(confirmar, registro);
		moverImagenCarpetaDefinitiva(confirmar.avatar);
		// Si es una COLECCIÓN TMDB, agregar las partes en forma automática
		if (confirmar.rubroAPI != "movie" && confirmar.fuente == "TMDB")
			agregarLasPartesDeLaColeccion(confirmar, registro);
		//return res.send(confirmar);
		// Borrar session y cookies del producto
		let metodos = ["palabrasClave", "desambiguar", "copiarFA"];
		metodos.push(...["datosDuros", "datosPers", "confirmar"]);
		for (metodo of metodos) {
			if (req.session[metodo]) delete req.session[metodo];
			if (req.cookies[metodo]) res.clearCookie(metodo);
		}
		// Redireccionar
		return res.redirect("/agregar/productos/conclusion");
	},

	conclusion: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "conclusion";
		// 2. Obtener los datos clave del producto
		IDdelProducto = req.session.IDdelProducto
			? req.session.IDdelProducto
			: req.cookies.IDdelProducto
			? req.cookies.IDdelProducto
			: "";
		if (!IDdelProducto)
			return res.redirect("/agregar/productos/palabras-clave");
		// 3. Averiguar si el producto está en una colección y la colección ya está en nuestra BD
		if (IDdelProducto.en_coleccion) {
		}
		// 4. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: IDdelProducto,
		});
	},

	responsabilidad: (req, res) => {
		tema = "agregar";
		codigo = "responsabilidad";
		return res.render("Home", { tema, codigo });
	},

	yaEnBD_Form: (req, res) => {
		return res.send("La Película / Colección ya está en nuestra BD");
	},
};

let obtenerDatosDelProductoTMDB = async (form) => {
	// API Details
	rubroAPI = form.rubroAPI;
	campo = rubroAPI == "movie" ? "peli_tmdb_id" : "colec_tmdb_id";
	let lectura =
		form.fuente == "TMDB"
			? await procesarProd.obtenerAPI_TMDB(form[campo], rubroAPI)
			: {};
	// Obtener la info para la vista 'Datos Duros'
	form.rubroAPI == "movie"
		? (rubro = "pelicula_TMDB")
		: form.rubroAPI == "tv"
		? (rubro = "TV_TMDB")
		: form.rubroAPI == "collection"
		? (rubro = "coleccion_TMDB")
		: "";
	return await procesarProd[rubro](form, lectura);
};

let revisarImagen = (tipo, tamano) => {
	tamanoMaximo = 2;
	return tipo.slice(0, 6) != "image/"
		? "Necesitamos un archivo de imagen"
		: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
		? "El tamaño del archivo es superior a " +
		  tamanoMaximo +
		  " MB, necesitamos uno más pequeño"
		: "";
};

let download = async (url, rutaYnombre) => {
	let writer = fs.createWriteStream(rutaYnombre);
	let response = await axios({
		method: "GET",
		url: url,
		responseType: "stream",
	});
	response.data.pipe(writer);
	return new Promise((resolve, reject) => {
		writer.on("finish", () => resolve(console.log("Imagen guardada")));
		writer.on("error", (err) => reject(err));
	});
};

let camposDD = () => {
	return [
		{
			titulo: "Título original",
			campo: "nombre_original",
			peli: true,
			colec: true,
		},
		{
			titulo: "Título en castellano",
			campo: "nombre_castellano",
			peli: true,
			colec: true,
		},
		{
			titulo: "Año de estreno",
			campo: "ano_estreno",
			id: true,
			peli: true,
			colec: true,
		},
		{
			titulo: "Año de finalización",
			campo: "ano_fin",
			id: true,
			peli: false,
			colec: true,
		},
		{
			titulo: "Duración (minutos)",
			campo: "duracion",
			id: true,
			peli: true,
			colec: false,
		},
		{ titulo: "Director", campo: "director", peli: true, colec: true },
		{ titulo: "Guión", campo: "guion", peli: true, colec: true },
		{ titulo: "Música", campo: "musica", peli: true, colec: true },
		{ titulo: "Actores", campo: "actores", peli: true, colec: true },
		{
			titulo: "Productor",
			campo: "productor",
			peli: true,
			colec: true,
		},
	];
};

let datosPersSelect = async () => {
	return [
		{
			titulo: "Existe una versión en castellano",
			campo: "en_castellano",
			tabla: "peliculas",
			valores: [
				{ id: 1, nombre: "SI" },
				{ id: 0, nombre: "NO" },
			],
			peli: true,
			colec: false,
			mensajes: [
				"Para poner SI, estate seguro de que hayas escuchado LA PELÍCULA ENTERA en ese idioma. No te guíes por el trailer.",
			],
		},
		{
			titulo: "Es a Color",
			campo: "color",
			tabla: "peliculas",
			valores: [
				{ id: 1, nombre: "SI" },
				{ id: 0, nombre: "NO" },
			],
			peli: true,
			colec: false,
			mensajes: ["SI: es a color.", "NO: es en blanco y negro."],
		},
		{
			titulo: "Categoría",
			campo: "categoria_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos("categorias", "orden"),
			peli: true,
			colec: true,
			mensajes: [
				'"Centradas en la Fe Católica", significa que el rol de la Fe Católica es protagónico.',
				'Si es cristiana pero no católica, se pone como "Valores Presentes en la Cultura".',
				'Para ponerla como "Valores Presentes en la Cultura", los buenos valores deben ser evidentes.',
			],
		},
		{
			titulo: "Sub-categoría",
			campo: "subcategoria_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos("subcategorias", "orden"),
			peli: true,
			colec: true,
			mensajes: ["Elegí la subcategoría que mejor represente el tema."],
		},
		{
			titulo: "Público sugerido",
			campo: "publico_sugerido_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos(
				"publicos_sugeridos",
				"orden"
			),
			peli: true,
			colec: true,
			mensajes: [
				"Mayores solamente: sensualidad o crueldad explícitos, pueden dañar la sensibilidad de un niño de 12 años.",
				"Mayores apto familia: para mayores, sin dañar la sensibilidad de un niño.",
				"Familia: ideal para compartir en familia y que todos disfruten",
				"Menores apto familia: para menores, también la puede disfrutar un adulto.",
				"Menores solamente: apuntado a un público solamente infantil.",
			],
		},
		{
			titulo: "Inspira fe y/o valores",
			campo: "fe_valores_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varias.obtenerTodos("fe_valores", "orden"),
			peli: true,
			colec: true,
			mensajes: ["¿Considerás que deja algo positivo en el corazón?"],
		},
		{
			titulo: "Entretiene",
			campo: "entretiene_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varias.obtenerTodos("entretiene", "orden"),
			peli: true,
			colec: true,
			mensajes: ["Se disfruta el rato viéndola"],
		},
		{
			titulo: "Calidad sonora y visual",
			campo: "calidad_tecnica_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varias.obtenerTodos("calidad_tecnica", "orden"),
			peli: true,
			colec: true,
			mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
		},
		{
			titulo: "Personaje histórico",
			campo: "personaje_historico_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos(
				"historicos_personajes",
				"nombre"
			),
			peli: true,
			colec: true,
			mensajes: [
				"Podés ingresar un registro nuevo, haciendo click acá.",
				"Si agregás un registro, tenés que actualizar la vista para poderlo ver.",
			],
			link: "personaje-historico",
		},
		{
			titulo: "Hecho histórico",
			campo: "hecho_historico_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos(
				"historicos_hechos",
				"nombre"
			),
			peli: true,
			colec: true,
			mensajes: [
				"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
				"Si agregás un registro, tenés que actualizar la vista para poderlo ver.",
			],
			link: "hecho-historico",
		},
	];
};

let datosPersInput = () => {
	return [
		{
			titulo: "Link del trailer",
			titulo2: "Link del 1er trailer",
			campo: "link_trailer",
			tabla: "peliculas",
			peli: true,
			colec: true,
			mensajes: [
				"Nos interesa el trailer del primer capítulo.",
				"Debe ser de un sitio seguro, sin virus.",
				"Es ideal si vincula a un link de You Tube.",
			],
		},
		{
			titulo: "Link de la película",
			titulo2: "Link de la 1a película",
			campo: "link_pelicula",
			tabla: "peliculas",
			peli: true,
			colec: true,
			mensajes: [
				"Nos interesa el link del primer capítulo.",
				"Debe ser de un sitio seguro, sin virus.",
				"Debe ser de un sitio con política de respeto al copyright. Ej: You Tube.",
				"Pedimos un link con una antigüedad mayor a 3 meses.",
				"En lo posible, elegí un link en castellano y de buena calidad.",
			],
		},
	];
};

let datosClaveDelProducto = (datos) => {
	// Enfoque en los datos clave
	let IDdelProducto = {};
	if (datos.rubroAPI == "movie") {
		// 1. Entidad
		IDdelProducto.entidad = "peliculas";
		IDdelProducto.producto = "Película";
		// 2. Campo 'id' externo
		IDdelProducto.campo =
			datos.fuente == "TMDB"
				? "peli_tmdb_id"
				: datos.fuente == "FA"
				? "peli_fa_id"
				: "";
		// 3. Está en colección 'SI' o 'NO'
		IDdelProducto.en_coleccion = datos.en_coleccion;
		// 4. Datos externos de la colección a la que pertenece, si corresponde
		if (datos.en_colec_tmdb_id) {
			IDdelProducto.en_colec_tmdb_id = datos.en_colec_tmdb_id;
			IDdelProducto.en_colec_nombre = datos.en_colec_nombre;
		}
	} else {
		// 1. Entidad
		IDdelProducto.entidad = "colecciones";
		IDdelProducto.producto = "Colección";
		// 2. Campo 'id' externo
		IDdelProducto.campo =
			datos.fuente == "TMDB"
				? "colec_tmdb_id"
				: datos.fuente == "FA"
				? "colec_fa_id"
				: "";
	}
	// Valor id externo
	IDdelProducto.valor =
		datos.fuente != "IM" ? datos[IDdelProducto.campo] : "";
	return IDdelProducto;
};

let actualizarRelacionConLaVida = async (entidad, id) => {
	if (id) {
		aux = await BD_varias.obtenerPorId(entidad, id);
		aux.cant_productos++;
		BD_varias.actualizarRegistro(
			entidad,
			{ cant_productos: aux.cant_productos },
			id
		);
	}
};

let guardarCalificaciones_us = (confirmar, productoEnBD) => {
	entidad_id = confirmar.rubroAPI == "movie" ? "peli_id" : "colec_id";
	let datos = {
		usuario_id: confirmar.creada_por_id,
		[entidad_id]: productoEnBD.id,
		fe_valores_id: confirmar.fe_valores_id,
		entretiene_id: confirmar.entretiene_id,
		calidad_tecnica_id: confirmar.calidad_tecnica_id,
		fe_valores_valor: confirmar.fe_valores,
		entretiene_valor: confirmar.entretiene,
		calidad_tecnica_valor: confirmar.calidad_tecnica,
		resultado: confirmar.calificacion,
	};
	BD_varias.agregarRegistro("calificaciones_us", datos);
};

let moverImagenCarpetaDefinitiva = (nombre) => {
	let rutaProvisoria = "./public/imagenes/9-Provisorio/" + nombre;
	let rutaDefinitiva = "./public/imagenes/2-Productos/" + nombre;
	fs.rename(rutaProvisoria, rutaDefinitiva, function (err) {
		if (err) {
			throw err;
		} else {
			console.log("Archivo de imagen movido a su carpeta definitiva");
		}
	});
};

let agregarLasPartesDeLaColeccion = async (confirmar, registro) => {
	partes = confirmar.partes;
	if (partes.length) {
		let orden = 0;
		for (parte of partes) {
			orden++;
			datos = {
				colec_id: registro.id,
				peli_tmdb_id: parte.peli_tmdb_id,
				orden: orden,
				creada_por_id: 2,
			};
			if (parte.nombre_original)
				datos.nombre_original = parte.nombre_original;
			if (parte.nombre_castellano)
				datos.nombre_castellano = parte.nombre_castellano;
			if (parte.ano_estreno) datos.ano_estreno = parte.ano_estreno;
			if (parte.cant_capitulos)
				datos.cant_capitulos = parte.cant_capitulos;
			if (parte.avatar) datos.avatar = parte.avatar;
			buscarPeliID = {
				entidad: "peliculas",
				campo: "peli_tmdb_id",
				valor: parte.peli_tmdb_id,
			};
			peli_id = await BD_varias.obtenerELC_id(buscarPeliID);
			if (peli_id) datos.peli_id = peli_id;
			BD_varias.agregarRegistro("colecciones_partes", datos);
		}
	}
};
