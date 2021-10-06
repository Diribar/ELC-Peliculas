// ************ Requires ************
let path = require("path");
let buscar_x_PalClave = require("../../funciones/PROD-buscar_x_PC");
let procesarProductos = require("../../funciones/PROD-procesar");
let validarProductos = require("../../funciones/PROD-validar");
let BD_peliculas = require("../../funciones/BD/peliculas");
let BD_colecciones = require("../../funciones/BD/colecciones");
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
			tema = "agregar";
			codigo = "palabrasClave";
			req.session.errores = errores;
			return res.redirect("/peliculas/agregar/palabras-clave");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.desambiguar = await buscar_x_PalClave.search(palabrasClave);
		res.cookie("desambiguar", req.session.desambiguar, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/peliculas/agregar/desambiguar");
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
			return res.redirect("/peliculas/agregar/palabras-clave");
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
		//return res.send(req.cookies.datosDuros)
		// 2. Redireccionar a la siguiente instancia
		return res.redirect("/peliculas/agregar/datos-duros");
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
			[, elc_id] = await procesarProductos.obtenerELC_id({
				rubroAPI: req.body.rubroAPI,
				fa_id,
			});
			if (elc_id) {
				errores.contenido = "Ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si hay errores de validación, redireccionar
		if (errores.hay) {
			tema = "agregar";
			codigo = "copiarFA";
			// return res.send(errores);
			req.session.errores = errores;
			return res.redirect("/peliculas/agregar/copiar-fa");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProductos.producto_FA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//return res.send(req.cookies)
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/peliculas/agregar/datos-duros");
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
			return res.redirect("/peliculas/agregar/palabras-clave");
		// 3. Render del formulario
		let errores = req.session.errores
			? req.session.errores
			: await validarProductos.datosDuros(datosDuros);
		let paises = await BD_varios.ObtenerTodos("paises", "nombre");
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: datosDuros,
			paises,
			errores,
		});
	},

	datosDurosGuardar: async (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros;
		if (!aux) return res.redirect("/peliculas/agregar/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosDuros = { ...aux, ...req.body };
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProductos.datosDuros(datosDuros);
		// 2.2. Averiguar si el TMDB_id o el FA_id ya está en la BD
		elc_id = await procesarProductos.obtenerELC_id({
			rubroAPI: req.body.rubroAPI,
			tmdb_id: req.body.tmdb_id,
			fa_id: req.body.fa_id,
		});
		if (elc_id[0] || elc_id[1]) {
			errores.nombre_original =
				"El código interno ya se encuentra en nuestra base de datos";
			errores.elc_id = elc_id;
			errores.hay = true;
		}
		// 2.3. Si el anterior OK, averiguar si el nombre_original ya está en la BD
		if (!errores.nombre_original) {
			registro =
				datosDuros.rubroAPI == "movie"
					? await BD_peliculas.ObtenerPorParametro(
							"nombre_original",
							datosDuros.nombre_original
					  )
					: await BD_colecciones.ObtenerPorParametro(
							"nombre_original",
							datosDuros.nombre_original
					  );
			if (registro) {
				errores.nombre_original =
					"El título original ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		//return res.send(errores);
		// 2.4. Si hay errores de validación, redireccionar
		if (errores.hay) {
			tema = "agregar";
			codigo = "datosDuros";
			req.session.errores = errores;
			return res.redirect("/peliculas/agregar/datos-duros");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.datosPers = req.session.datosDuros;
		res.cookie("datosPers", req.session.datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//return res.send(req.cookies)
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/peliculas/agregar/datos-personalizados");
	},

	DatosPersForm: (req, res) => {
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
			return res.redirect("/peliculas/agregar/palabras-clave");
		// 3. Render del formulario
		let errores = req.session.errores
			? req.session.errores
			: //: await validarProductos.datosPers(datosPers);
			  "";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			data_entry: datosPers,
			errores,
		});
	},

	DatosPersGuardar: (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers;
		if (!aux) return res.redirect("/peliculas/agregar/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosPers = { ...req.cookies.datosPers, ...req.body };
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		let errores = false;
		//let errores = await validarProductos.datosPers(datosPers);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			tema = "agregar";
			codigo = "datosPers";
			req.session.errores = errores;
			return res.redirect("/peliculas/agregar/datos-personalizados");
		}
		// 3. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/peliculas/agregar/resumen");
	},

	ResumenForm: (req, res) => {
		return res.send("Estoy en ResumenForm");
	},

	ResumenGuardar: (req, res) => {
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
	let lectura =
		form.fuente == "TMDB"
			? await procesarProductos.obtenerAPI(form.tmdb_id, form.rubroAPI)
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

let actualizarCookiesProductos = async (producto, res) => {
	let camposTotales = [
		"fuente",
		"rubroAPI",
		"tmdb_id",
		"fa_id",
		"imdb_id",
		"coleccion_tmdb_id",
		"nombre_original",
		"nombre_castellano",
		"idioma_original",
		"ano_estreno",
		"ano_fin",
		"partes",
		"duracion",
		"pais_id",
		"director",
		"guion",
		"musica",
		"productor",
		"actores",
		"avatar",
		"sinopsis",
	];
	// Obtener los campos
	// modelo =
	// 	producto.rubroAPI == "movie"
	// 		? await BD_peliculas.ObtenerPorID(1)
	// 		: await BD_colecciones.ObtenerPorID(1);
	// camposTotales = modelo._options.attributes;
	camposProducto = Object.keys(producto);
	// Borrar cookies de producto viejo
	for (campo of camposTotales) {
		camposProducto.includes(campo)
			? res.cookie(campo, producto[campo], { maxAge: 1000 * 60 * 60 })
			: res.clearCookie(campo);
	}
};
