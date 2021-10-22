// ************ Requires ************
let fs = require("fs");
let request = require("request");
let requestPromise = require("request-promise");
let path = require("path");
let procesarProductos = require("../../funciones/Productos/2-PROD-procesar");
let validarProductos = require("../../funciones/Productos/3-PROD-errores");
let BD_peliculas = require("../../funciones/BD/peliculas");
let BD_colecciones = require("../../funciones/BD/coleccionesCabecera");
let BD_varios = require(path.join(__dirname, "../../funciones/BD/varios"));

// *********** Controlador ***********
module.exports = {
	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosDurosP";
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

	datosDurosGuardar: async (req, res) => {
		return res.send(req.body);
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros;
		if (!aux) return res.redirect("/productos/agregar/palabras-clave");
		// 1.2. Guardar el data entry en session y cookie
		let datosDuros = { ...aux, ...req.body };
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProductos.datosDuros(datosDuros);
		// 2.2. Averiguar si el peli_TMDB_id o el peli_FA_id ya está en la BD
		if (req.body.peli_tmdb_id) {
			campo = "peli_tmdb_id";
			id = req.body.peli_tmdb_id;
		}
		if (req.body.peli_fa_id) {
			campo = "peli_fa_id";
			id = req.body.peli_fa_id;
		}
		elc_id = await procesarProductos.obtenerELC_id({
			rubroAPI: req.body.rubroAPI,
			campo,
			id,
		});
		if (elc_id) {
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
		// 2.4. Si aún no hay errores de imagen, revisar el archivo de imagen
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

	DatosPersForm: async (req, res) => {
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

	DatosPersGuardar: async (req, res) => {
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
		let errores = await validarProductos.datosPers(datosPers);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			//return res.send([datosPers.color, req.session.datosPers.color]);
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

let download = (uri, filename) => {
	request.head(uri, () => {
		request(uri)
			.pipe(fs.createWriteStream(filename))
			.on("close", () => console.log("imagen guardada"));
	});
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
		},
		{
			titulo: "Es a Color",
			campo: "color",
			tabla: "peliculas",
			valores: [
				{ id: 1, nombre: "SI" },
				{ id: 0, nombre: "NO" },
			],
		},
		{
			titulo: "Categoría",
			campo: "categoria_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos("categorias", "orden"),
		},
		{
			titulo: "Sub-categoría",
			campo: "subcategoria_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos("subcategorias", "orden"),
		},
		{
			titulo: "Público sugerido",
			campo: "publico_sugerido_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
				"publicos_sugeridos",
				"orden"
			),
		},
		{
			titulo: "Inspira fe y/o valores",
			campo: "fe_valores_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos("fe_valores", "orden"),
		},
		{
			titulo: "Entretiene",
			campo: "entretiene_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos("entretiene", "orden"),
		},
		{
			titulo: "Calidad sonora y visual",
			campo: "calidad_sonora_visual_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varios.ObtenerTodos(
				"calidad_sonora_visual",
				"orden"
			),
		},
		{
			titulo: "Personaje histórico",
			campo: "personaje_historico_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
				"personajes_historicos",
				"nombre"
			),
		},
		{
			titulo: "Hecho histórico",
			campo: "hecho_historico_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos(
				"hechos_historicos",
				"nombre"
			),
		},
		{
			titulo: "Sugerida para fecha",
			campo: "sugerida_para_evento_id",
			tabla: "peliculas",
			valores: await BD_varios.ObtenerTodos("eventos", "orden"),
		},
	];
};

let datosPersInput = () => {
	return [
		{
			titulo: "Link del trailer",
			campo: "trailer",
			tabla: "peliculas",
		},
		{
			titulo: "Link de la película",
			campo: "pelicula",
			tabla: "peliculas",
		},
	];
};
