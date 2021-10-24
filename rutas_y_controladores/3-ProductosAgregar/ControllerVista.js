// ************ Requires ************
let fs = require("fs");
let path = require("path");
let request = require("request");
let requestPromise = require("request-promise");
let buscar_x_PalClave = require("../../funciones/Productos/1-PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/Productos/2-PROD-procesar");
let validarProductos = require("../../funciones/Productos/3-PROD-errores");
let BD_varios = require(path.join(__dirname, "../../funciones/BD/varios"));

// *********** Controlador ***********
module.exports = {
	palabrasClaveForm: (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "palabrasClave";
		// 2. Data Entry propio y errores
		let palabrasClave = req.session.palabrasClave
			? req.session.palabrasClave
			: req.cookies.palabrasClave
			? req.cookies.palabrasClave
			: "";
		let errores = req.session.errores ? req.session.errores : false;
		// 3. Render del formulario
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
		let errores = await validarProductos.palabrasClave(palabrasClave);
		if (errores.palabrasClave) {
			req.session.errores = errores;
			return res.redirect("/productos/agregar/palabras-clave");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.desambiguar = await buscar_x_PalClave.search(palabrasClave);
		res.cookie("desambiguar", req.session.desambiguar, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/productos/agregar/desambiguar");
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
			return res.redirect("/productos/agregar/palabras-clave");
		// 3. Render del formulario
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
		//return res.send(req.session.datosDuros);
		// 2. Redireccionar a la siguiente instancia
		res.redirect("/productos/agregar/datos-duros");
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
		// 3. Render del formulario
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
			campo = copiarFA.rubroAPI == "movie" ? "peli_fa_id" : "colec_fa_id";
			elc_id = await procesarProductos.obtenerELC_id({
				rubroAPI: copiarFA.rubroAPI,
				campo: campo,
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
		//return res.send(errores);
		if (errores.hay) {
			// return res.send(errores);
			req.session.errores = errores;
			return res.redirect("/productos/agregar/copiar-fa");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProductos.producto_FA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//return res.send(req.session.datosDuros);
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/productos/agregar/datos-duros");
	},

	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosDuros";
		// 2. Feedback de la instancia anterior o Data Entry propio
		datosDuros = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros
			? req.cookies.datosDuros
			: "";
		if (!datosDuros)
			return res.redirect("/productos/agregar/palabras-clave");
		// 3. Render del formulario
		let errores = req.session.errores
			? req.session.errores
			: await validarProductos.datosDuros(datosDuros, camposDD());
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		let pais = datosDuros.pais_id
			? await BD_varios.pais_idToNombre(datosDuros.pais_id)
			: "";
		//return res.send(datosDuros);
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
		//return res.send(req.body);
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros;
		if (!aux) return res.redirect("/productos/agregar/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosDuros = { ...aux, ...req.body };
		// return res.send(datosDuros);
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//return res.send(datosDuros);
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProductos.datosDuros(datosDuros, camposDD());
		// 2.2. Averiguar si el TMDB_id o el FA_id ya están en la BD
		// Obtener los parámetros
		fuente = datosDuros.fuente.toLowerCase();
		campo = datosDuros.rubroAPI == "movie" ? "peli" : "colec";
		campo += "_" + fuente + "_id";
		id = datosDuros[campo];
		// Averiguar si hubieron errores
		elc_id = await procesarProductos.obtenerELC_id({
			rubroAPI: datosDuros.rubroAPI,
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
				rutaYnombre = "public/imagenes/4-Provisorio/" + nombre;
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
			if (req.file) fs.unlinkSync(rutaYnombre); // Borrar el archivo de multer
			req.session.errores = errores;
			return res.redirect("/productos/agregar/datos-duros");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosPers = req.session.datosDuros;
		req.session.datosPers.avatar = nombre;
		//return res.send(req.session.datosPers);
		res.cookie("datosPers", req.session.datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/productos/agregar/datos-personalizados");
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
		if (!datosPers)
			return res.redirect("/productos/agregar/palabras-clave");
		// 3. Render del formulario
		let errores = req.session.errores ? req.session.errores : "";
		//return res.send([datosPers.color, req.session.datosPers.color]);
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
		if (!aux) return res.redirect("/productos/agregar/palabras-clave");
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
			//return res.send(errores);
			return res.redirect("/productos/agregar/datos-personalizados");
		}
		// 3. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/productos/agregar/resumen");
	},

	resumenForm: (req, res) => {
		return res.send("Estoy en ResumenForm");
	},

	resumenGuardar: (req, res) => {
		return res.send("Estoy en ResumenGuardar");
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
	tamanoMaximo = 1;
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
		},
		{
			titulo: "Categoría",
			campo: "categoria_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos("categorias", "orden"),
			peli: true,
			colec: true,
		},
		{
			titulo: "Sub-categoría",
			campo: "subcategoria_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos("subcategorias", "orden"),
			peli: true,
			colec: true,
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
		},
		{
			titulo: "Inspira fe y/o valores",
			campo: "fe_valores_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos("fe_valores", "orden"),
			peli: true,
			colec: true,
		},
		{
			titulo: "Entretiene",
			campo: "entretiene_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos("entretiene", "orden"),
			peli: true,
			colec: true,
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
		},
		{
			titulo: "Personaje histórico",
			campo: "personaje_historico_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
				"personajes_historicos",
				"nombre"
			),
			peli: true,
			colec: true,
		},
		{
			titulo: "Hecho histórico",
			campo: "hecho_historico_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
				"hechos_historicos",
				"nombre"
			),
			peli: true,
			colec: true,
		},
	];
};

let datosPersInput = () => {
	return [
		{
			titulo: "Link del trailer",
			campo: "link_trailer",
			tabla: "peliculas",
			peli: true,
			colec: true,
		},
		{
			titulo: "Link de la película",
			campo: "link_pelicula",
			tabla: "peliculas",
			peli: true,
			colec: true,
		},
	];
};
