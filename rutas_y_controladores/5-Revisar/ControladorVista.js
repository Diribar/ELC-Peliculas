// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");
let varias = require("../../funciones/Varias/Varias");

// *********** Controlador ***********
module.exports = {
	visionGeneral: async (req, res) => {
		tema = "revision";
		codigo = "visionGeneral";
		// Definir variables
		let status = await BD_especificas.obtenerStatus();
		let ai = [status.aprobado_id, status.inactivado_id];
		let haceUnaHora = varias.funcionHaceUnaHora();
		// Obtener Productos -------------------------------------------------------------
		let includes = ["personaje", "hecho", "valor", "status_registro"];
		let peliculas = await BD_especificas.obtenerProductos("peliculas", includes, haceUnaHora, ai);
		let colecciones = await BD_especificas.obtenerProductos("colecciones", includes, haceUnaHora, ai);
		let Productos = [...peliculas, ...colecciones];
		// Obtener los productos en sus variantes a mostrar
		let prodCreado = prodPorStatus(Productos, status.creado_id);
		let prodInactivar = prodPorStatus(Productos, status.inactivar_id);
		let prodRecuperar = prodPorStatus(Productos, status.recuperar_id);
		Productos = [...prodInactivar, ...prodCreado, ...prodRecuperar];
		//return res.send(Productos);
		// Obtener las ediciones en status 'edicion' --> PENDIENTE ----------------------

		// Obtener RCLV -----------------------------------------------------------------
		let personajes = await BD_especificas.obtenerRCLV("RCLV_personajes", haceUnaHora);
		let hechos = await BD_especificas.obtenerRCLV("RCLV_hechos", haceUnaHora);
		let valores = await BD_especificas.obtenerRCLV("RCLV_valores", haceUnaHora);
		let RCLV = [...personajes, ...hechos, ...valores];
		//return res.send(RCLV[0])
		// Obtener los RCLV en sus variantes a mostrar
		let RCLV_creado = rclvCreado(RCLV, status.creado_id);
		let RCLV_sinProds = rclvSinProds(RCLV, status.creado_id, status.aprobado_id);
		RCLV = [...RCLV_creado, ...RCLV_sinProds];
		//return res.send([RCLV_creado, RCLV_sinProds]);
		// Obtener Links ----------------------------------------------------------------
		includes = ["pelicula", "coleccion", "capitulo"];
		let links = await BD_especificas.obtenerLinks(haceUnaHora, includes, ai);
		// Obtener los productos de los links
		let prodsLinks = productosLinks(links, status.aprobado_id);
		//return res.send(prodsLinks);

		// Ir a la vista
		// return res.send("Revisar");
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			Productos,
			RCLV,
			prodsLinks,
		});
	},
};

// Funciones ------------------------------------------------------------------------------
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
		{nombre: "pelicula", entidad: "peliculas", abrev: "PEL"},
		{nombre: "coleccion", entidad: "colecciones", abrev: "COL"},
		{nombre: "capitulo", entidad: "capitulos", abrev: "CAP"},
	];
	// Rutina para cada link
	for (link of links) {
		let dato = {};
		// Verificación para cada Producto
		for (aux of auxs) {
			if (link[aux.nombre] && link[aux.nombre].status_registro_id == aprobado_id) {
				dato = {
					entidad: aux.entidad,
					id: link[aux.nombre].id,
					nombre_castellano: link[aux.nombre].nombre_castellano,
					ano_estreno: link[aux.nombre].ano_estreno,
					abrev: aux.abrev,
				};
				break
			}
		}
		if (dato != {} && prods.findIndex((n) => n.entidad == dato.entidad && n.id == dato.id) < 0) {
			dato = {...dato, fecha: link.fecha_referencia};
			prods.push(dato);
		}
	}
	return prods;
};
