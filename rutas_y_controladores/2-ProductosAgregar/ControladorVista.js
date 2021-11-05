// ************ Requires ************
let fs = require("fs");
let path = require("path");
let request = require("request");
let requestPromise = require("request-promise");
let buscar_x_PalClave = require("../../funciones/Productos/1-PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/Productos/2-PROD-procesar");
let validarProductos = require("../../funciones/Productos/3-PROD-errores");
let BD_varios = require("../../funciones/BD/varios");

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
			? await validarProductos.palabrasClave(palabrasClave)
			: "";
		// 3. Eliminar session y cookie posteriores, si existen
		if (req.cookies.desambiguar) res.clearCookie("desambiguar");
		if (req.session.desambiguar) delete req.session.desambiguar;
		// 4. Render del formulario
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
		//return res.send(req.cookies);
		// 2. Si hay errores de validación, redireccionar
		let errores = await validarProductos.palabrasClave(palabrasClave);
		if (errores.palabrasClave) {
			req.session.errores = errores;
			return res.redirect("/agregar/productos/palabras-clave");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.desambiguar = await buscar_x_PalClave.search(palabrasClave);
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
		// 2. Feedback de la instancia anterior
		desambiguar = req.session.desambiguar
			? req.session.desambiguar
			: req.cookies.desambiguar
			? req.cookies.desambiguar
			: "";
		if (!desambiguar)
			return res.redirect("/agregar/productos/palabras-clave");
		// 3. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.session.datosDuros) delete req.session.datosDuros;
		// 4. Render del formulario
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
		// 2. Data Entry propio y errores
		let copiarFA = req.session.copiarFA
			? req.session.copiarFA
			: req.cookies.copiarFA
			? req.cookies.copiarFA
			: "";
		let errores = req.session.errores
			? req.session.errores
			: copiarFA
			? await validarProductos.copiarFA(copiarFA)
			: "";
		// 3. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.session.datosDuros) delete req.session.datosDuros;
		// 4. Render del formulario
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
		let errores = await validarProductos.copiarFA(copiarFA);
		// 2.2. Averiguar si el FA_id ya está en la BD
		if (!errores.direccion) {
			fa_id = await procesarProductos.obtenerFA_id(req.body.direccion);
			entidad =
				copiarFA.rubroAPI == "movie" ? "peliculas" : "colecciones";
			campo = copiarFA.rubroAPI == "movie" ? "peli_fa_id" : "colec_fa_id";
			elc_id = await procesarProductos.obtenerELC_id({
				entidad,
				campo,
				id: fa_id,
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
		req.session.datosDuros = await procesarProductos.producto_FA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/datos-duros");
	},

	datosDurosForm: async (req, res) => {
		//return res.send(req.cookies)
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosDuros";
		// 2. Feedback de la instancia anterior o Data Entry propio
		datosDuros = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros
			? req.cookies.datosDuros
			: "";
		// Detectar el origen
		origen =
			req.session.desambiguar || req.cookie.desambiguar
				? "desambiguar"
				: req.session.copiarFA || req.cookie.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!datosDuros) return res.redirect("/agregar/productos/" + origen);
		// 3. GuardarIDdelProducto
		IDdelProducto = datosClaveDelProducto(datosDuros);
		req.session.IDdelProducto = IDdelProducto;
		res.cookie("IDdelProducto", IDdelProducto, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosPers) res.clearCookie("datosPers");
		if (req.session.datosPers) delete req.session.datosPers;
		// 5. Render del formulario
		let errores = req.session.errores
			? req.session.errores
			: await validarProductos.datosDuros(datosDuros, camposDD());
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		let pais = datosDuros.pais_id
			? await BD_varios.pais_idToNombre(datosDuros.pais_id)
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
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros;
		// Detectar el origen
		origen =
			req.session.desambiguar || req.cookie.desambiguar
				? "desambiguar"
				: req.session.copiarFA || req.cookie.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!aux) return res.redirect("/agregar/productos/" + origen);
		// 1.2. Guardar el data entry en session y cookie
		let datosDuros = { ...aux, ...req.body };
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProductos.datosDuros(datosDuros, camposDD());
		// 2.2. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id o el FA_id ya están en la BD
		if (!errores.nombre_original) {
			// Obtener los parámetros
			fuente = datosDuros.fuente.toLowerCase();
			entidad =
				datosDuros.rubroAPI == "movie" ? "peliculas" : "colecciones";
			campo = datosDuros.rubroAPI == "movie" ? "peli" : "colec";
			campo += "_" + fuente + "_id";
			id = datosDuros[campo];
			// Averiguar si hubieron errores
			elc_id = await procesarProductos.obtenerELC_id({
				entidad,
				campo,
				id,
			});
			// Acciones si hubieron errores
			if (elc_id) {
				errores.nombre_original =
					"El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si aún no hay errores de imagen, revisar el archivo de imagen
		if (!errores.avatar) {
			if (req.file) {
				// En caso de archivo por multer
				tipo = req.file.mimetype;
				tamano = req.file.size;
				nombre = req.file.filename;
				rutaYnombre = req.file.path;
			} else {
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
			errores.avatar
				? (errores.hay = true) // Marcar que sí hay errores
				: !req.file
				? download(datosDuros.avatar, rutaYnombre) // Grabar el archivo de url
				: "";
		}
		// 2.4. Si hay errores de validación, redireccionar
		if (errores.hay) {
			//return res.send(errores)
			if (req.file) fs.unlinkSync(rutaYnombre); // Borrar el archivo de multer
			req.session.errores = errores;
			return res.redirect("/agregar/productos/datos-duros");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosPers = req.session.datosDuros;
		req.session.datosPers.avatarDP = nombre;
		res.cookie("datosPers", req.session.datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/productos/datos-personalizados");
	},

	datosPersForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosPers";
		// 2. Feedback de la instancia anterior o Data Entry propio
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/agregar/productos/datos-duros");
		// 3. GuardarIDdelProducto
		IDdelProducto = datosClaveDelProducto(datosPers);
		req.session.IDdelProducto = IDdelProducto;
		res.cookie("IDdelProducto", IDdelProducto, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Eliminar session y cookie posteriores, si existen
		if (req.cookies.confirmar) res.clearCookie("confirmar");
		if (req.session.confirmar) delete req.session.confirmar;
		// 5. Render del formulario
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
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		camposDP = [...(await datosPersSelect()), ...datosPersInput()];
		let errores = await validarProductos.datosPers(datosPers, camposDP);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect("/agregar/productos/datos-personalizados");
		}
		// 3. Si no hay errores, obtener la calificación
		fe_valores = await BD_varios.ObtenerPorParametro(
			"fe_valores",
			"id",
			req.body.fe_valores_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		entretiene = await BD_varios.ObtenerPorParametro(
			"entretiene",
			"id",
			req.body.entretiene_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calidad_sonora_visual = await BD_varios.ObtenerPorParametro(
			"calidad_sonora_visual",
			"id",
			req.body.calidad_sonora_visual_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calificacion = (
			fe_valores * 0.5 +
			entretiene * 0.3 +
			calidad_sonora_visual * 0.2
		).toFixed(2);
		// Preparar la info para el siguiente paso
		req.session.confirmar = {
			...req.session.datosPers,
			colec_tmdb_rubro: req.session.datosPers.rubroAPI,
			fe_valores,
			entretiene,
			calidad_sonora_visual,
			calificacion,
			avatar: req.session.datosPers.avatarDP,
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
		//return res.send(req.session);
		registro = await BD_varios.agregarPorEntidad(entidad, confirmar);
		// Actualizar "cantProductos" en "Relación con la vida"

		// Guardar calificaciones_us

		// Mover el archivo de imagen a la carpeta definitiva

		// Si se agregó una COLECCIÓN TMDB:
		// SI: Agregar las partes de la colección en forma automática.
		// NO, pero es colección: req.session y cookie con el dato de la colección
		// NO, y no tiene ninguna relación con una colección: do nothing

		// Borrar session y cookies del producto
		if (req.session.palabrasClave) delete req.session.palabrasClave;
		if (req.session.desambiguar) delete req.session.desambiguar;
		if (req.session.copiarFA) delete req.session.copiarFA;
		if (req.session.datosDuros) delete req.session.datosDuros;
		if (req.session.datosPers) delete req.session.datosPers;
		if (req.session.confirmar) delete req.session.confirmar;
		if (req.session.IDdelProducto) delete req.session.IDdelProducto;
		if (req.session.errores) delete req.session.errores;
		if (req.cookies.palabrasClave) res.clearCookie("palabrasClave");
		if (req.cookies.desambiguar) res.clearCookie("desambiguar");
		if (req.cookies.copiarFA) res.clearCookie("copiarFA");
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.cookies.datosPers) res.clearCookie("datosPers");
		if (req.cookies.confirmar) res.clearCookie("confirmar");
		if (req.cookies.IDdelProducto) res.clearCookie("IDdelProducto");
		if (req.cookies.errores) res.clearCookie("errores");
		// Redireccionar
		return res.send(registro);
	},

	finDelProcesoForm: (req, res) => {
		return res.send("finDelProcesoForm");
	},

	finDelProcesoGuardar: (req, res) => {
		return res.send("finDelProcesoGuardar");
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
			? await procesarProductos.obtenerAPI_TMDB(form[campo], rubroAPI)
			: {};
	// Obtener la info para la vista 'Datos Duros'
	form.rubroAPI == "movie"
		? (rubro = "pelicula_TMDB")
		: form.rubroAPI == "tv"
		? (rubro = "TV_TMDB")
		: form.rubroAPI == "collection"
		? (rubro = "coleccion_TMDB")
		: "";
	let resultado = await procesarProductos[rubro](form, lectura);
	return resultado;
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

let download = (uri, filename) => {
	request.head(uri, () => {
		request(uri)
			.pipe(fs.createWriteStream(filename))
			.on("close", () => console.log("imagen guardada"));
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
			valores: await BD_varios.ObtenerTodos("categorias", "orden"),
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
			valores: await BD_varios.ObtenerTodos("subcategorias", "orden"),
			peli: true,
			colec: true,
			mensajes: ["Elegí la subcategoría que mejor represente el tema."],
		},
		{
			titulo: "Público sugerido",
			campo: "publico_sugerido_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
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
			valores: await BD_varios.ObtenerTodos("fe_valores", "orden"),
			peli: true,
			colec: true,
			mensajes: ["¿Considerás que deja algo positivo en el corazón?"],
		},
		{
			titulo: "Entretiene",
			campo: "entretiene_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos("entretiene", "orden"),
			peli: true,
			colec: true,
			mensajes: ["Se disfruta el rato viéndola"],
		},
		{
			titulo: "Calidad sonora y visual",
			campo: "calidad_sonora_visual_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos(
				"calidad_sonora_visual",
				"orden"
			),
			peli: true,
			colec: true,
			mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
		},
		{
			titulo: "Personaje histórico",
			campo: "personaje_historico_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
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
			valores: await BD_varios.ObtenerTodos(
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
		IDdelProducto.entidad = "peliculas";
		IDdelProducto.campo =
			datos.fuente == "TMDB"
				? "peli_tmdb_id"
				: datos.fuente == "FA"
				? "peli_fa_id"
				: "";
	} else {
		IDdelProducto.entidad = "colecciones";
		IDdelProducto.campo =
			datos.fuente == "TMDB"
				? "colec_tmdb_id"
				: datos.fuente == "FA"
				? "colec_fa_id"
				: "";
	}
	IDdelProducto.id = datos.fuente != "IM" ? datos[IDdelProducto.campo] : "";
	return IDdelProducto;
};
