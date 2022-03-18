// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let varias = require("../../funciones/Varias/Varias");

// *********** Controlador ***********
module.exports = {
	visionGeneral: async (req, res) => {
		tema = "revision";
		codigo = "visionGeneral";
		// Definir variables
		let status = await BD_especificas.obtenerStatus();
		let aprobInact = [status.aprobado_id, status.inactivado_id];
		let userID = req.session.usuario.id;
		let haceUnaHora = varias.funcionHaceUnaHora();
		// Obtener Productos -------------------------------------------------------------
		let includes = ["personaje", "hecho", "valor", "status_registro"];
		let peliculas = await BD_especificas.obtenerProductos(
			"peliculas",
			includes,
			haceUnaHora,
			aprobInact,
			userID
		).then((n) => procesar(n, "peliculas"));
		let colecciones = await BD_especificas.obtenerProductos(
			"colecciones",
			includes,
			haceUnaHora,
			aprobInact,
			userID
		).then((n) => procesar(n, "colecciones"));
		// Obtener las ediciones en status 'edicion' --> PENDIENTE ----------------------

		// Consolidar Productos y ordenar
		let Productos = [...peliculas, ...colecciones].sort((a, b) => {
			return new Date(a.fecha) - new Date(b.fecha);
		});
		// Obtener RCLV -----------------------------------------------------------------
		includes = ["peliculas", "colecciones", "capitulos"];
		let personajes = await BD_especificas.obtenerRCLV(
			"RCLV_personajes",
			includes,
			haceUnaHora,
			aprobInact,
			userID
		);
		let hechos = await BD_especificas.obtenerRCLV(
			"RCLV_hechos",
			includes,
			haceUnaHora,
			aprobInact,
			userID
		);
		let valores = await BD_especificas.obtenerRCLV(
			"RCLV_valores",
			includes,
			haceUnaHora,
			aprobInact,
			userID
		);
		let RCLV = [...personajes, ...hechos, ...valores];
		// Obtener los RCLV en sus variantes a mostrar
		let RCLV_creado = rclvCreado(RCLV, status.creado_id);
		let RCLV_sinProds = rclvSinProds(RCLV, status.creado_id, status.aprobado_id);
		RCLVs = [...RCLV_creado, ...RCLV_sinProds];
		// Obtener Links ----------------------------------------------------------------
		includes = ["pelicula", "coleccion", "capitulo"];
		let links = await BD_especificas.obtenerLinks(haceUnaHora, includes, aprobInact, userID);
		// Obtener los productos de los links
		let prodsLinks = productosLinks(links, status.aprobado_id);

		// Ir a la vista
		//return res.send(peliculas);
		//return res.send(RCLV_creado)
		//return res.send(links);
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			Productos,
			RCLVs,
			prodsLinks,
			status,
		});
	},
};

// Funciones ------------------------------------------------------------------------------
let procesar = (array, entidad) => {
	// Procesar los registros
	let anchoMax = 30;
	return array.map((registro) => {
		let nombre =
			(registro.nombre_castellano.length > anchoMax
				? registro.nombre_castellano.slice(0, anchoMax - 1) + "…"
				: registro.nombre_castellano) +
			" (" +
			registro.ano_estreno +
			")";
		return {
			id: registro.id,
			entidad,
			nombre: nombre,
			ano_estreno: registro.ano_estreno,
			abrev: registro.entidad.slice(0, 3).toUpperCase(),
			status_registro_id: registro.status_registro_id,
			fecha: registro.creado_en,
		};
	});
};
let prodPorStatus = (array, status) => {
	return array.length ? array.filter((n) => n.status_registro_id == status) : [];
};
let rclvCreado = (array, creado_id) => {
	// Creado, con productos aprobados
	return array.length
		? array.filter((n) => n.status_registro_id == creado_id && n.cant_prod_aprobados)
		: [];
};
let rclvSinProds = (array, creado_id, aprobado_id) => {
	// Status 'creado' / 'aprobado', sin productos creados, sin productos aprobados
	return array.length
		? array.filter(
				(n) =>
					(n.status_registro_id == creado_id || n.status_registro_id == aprobado_id) &&
					!n.cant_prod_creados &&
					!n.cant_prod_aprobados
		  )
		: [];
};
let productosLinks = (links, aprobado_id) => {
	// Resultado esperado:
	//	- Solo productos aprobados
	//	- Campos: {abrev, entidad, id, ano_estreno,}

	// Definir las  variables
	let prods = [];
	let auxs = [
		{nombre: "pelicula", entidad: "peliculas"},
		{nombre: "coleccion", entidad: "colecciones"},
		{nombre: "capitulo", entidad: "capitulos"},
	];
	// Rutina para cada link
	for (link of links) {
		let dato = {};
		// Verificación para cada Producto
		for (aux of auxs) {
			if (
				link[aux.nombre] &&
				link[aux.nombre].status_registro_id == aprobado_id &&
				prods.findIndex((n) => n.entidad == aux.entidad && n.id == link[aux.nombre].id) < 0
			)
				prods.push({
					entidad: aux.entidad,
					id: link[aux.nombre].id,
					nombre: link[aux.nombre].nombre_castellano,
					ano_estreno: link[aux.nombre].ano_estreno,
					abrev: aux.nombre.slice(0, 3).toUpperCase(),
				});
		}
	}
	return prods;
};
