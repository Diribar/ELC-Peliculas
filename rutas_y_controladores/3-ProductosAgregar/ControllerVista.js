// ************ Requires ************
let buscar_x_PalClave = require("../../funciones/Productos/1-PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/Productos/2-PROD-procesar");
let validarProductos = require("../../funciones/Productos/3-PROD-errores");

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
			tema = "agregar";
			codigo = "palabrasClave";
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
		return req.session.datosDuros.rubroAPI == "movie"
			? res.redirect("/peliculas/agregar/datos-duros")
			: res.redirect("/colecciones/agregar/datos-duros");
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
			elc_id = await procesarProductos.obtenerELC_id({
				rubroAPI: req.body.rubroAPI,
				campo: "fa_id",
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
			tema = "agregar";
			codigo = "copiarFA";
			// return res.send(errores);
			req.session.errores = errores;
			return res.redirect("/productos/agregar/copiar-fa");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProductos.producto_FA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		return res.send(req.session.datosDuros);
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return req.session.datosDuros.rubroAPI == "movie"
			? res.redirect("/peliculas/agregar/datos-duros")
			: res.redirect("/colecciones/agregar/datos-duros");
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
			: await validarProductos.datosDuros(datosDuros);
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		let pais = datosDuros.pais_id
			? await BD_varios.pais_idToNombre(datosDuros.pais_id)
			: "";
		let datos = [
			{ titulo: "Título original", campo: "nombre_original" },
			{ titulo: "Título en castellano", campo: "nombre_castellano" },
			{ titulo: "Año de estreno", campo: "ano_estreno", id: true },
			{ titulo: "Duración (minutos)", campo: "duracion", id: true },
			{ titulo: "Director", campo: "director" },
			{ titulo: "Guión", campo: "guion" },
			{ titulo: "Música", campo: "musica" },
			{ titulo: "Actores", campo: "actores" },
			{ titulo: "Productor", campo: "productor" },
		];
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: datosDuros,
			pais,
			paises,
			errores,
			datos,
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
			? await procesarProductos.obtenerAPI(form[campo], rubroAPI)
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
