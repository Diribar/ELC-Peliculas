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
		let haceUnaHora = varias.funcionHaceUnaHora();
		// Obtener Productos -------------------------------------------------------------
		let includes = ["personaje", "hecho", "valor", "status_registro"];
		let st = [status.aprobado_id, status.inactivado_id];
		let peliculas = await obtenerProductos("peliculas", includes, haceUnaHora, st);
		let colecciones = await obtenerProductos("colecciones", includes, haceUnaHora, st);
		let Productos = [...peliculas, ...colecciones];
		// Obtener los productos en sus variantes a mostrar
		let prodCreado = extraerPorStatus(Productos, status.creado_id);
		let prodInactivar = extraerPorStatus(Productos, status.inactivar_id);
		let prodRecuperar = extraerPorStatus(Productos, status.recuperar_id);
		//return res.send(productosCreado);
		// Obtener las ediciones en status 'edicion' --> PENDIENTE ----------------------

		// Obtener RCLV -----------------------------------------------------------------
		let personajes = await BD_especificas.obtenerTodos_Revision("RCLV_personajes", "");
		let hechos = await BD_especificas.obtenerTodos_Revision("RCLV_hechos", "");
		let valores = await BD_especificas.obtenerTodos_Revision("RCLV_valores", "");
		let RCLV = [...personajes, ...hechos, ...valores];
		// Obtener los RCLV en sus variantes a mostrar
		let [RCLV_creado, RCLV_sinProd] = RCLVs_status(RCLV, status);
		//return res.send(RCLV);
		// Obtener Links ----------------------------------------------------------------

		// Ir a la vista
		// return res.send("Revisar");
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			prodCreado,
			prodEditado,
			prodInactivar,
			prodRecuperar,
		});
	},
};

// Funciones ------------------------------------------------------------------------------

let obtenerProductos = async (entidad, includes, haceUnaHora, status) => {
	return db[entidad]
		.findAll({
			where: {
				// 	Con registro distinto a 'aprobado' e 'inactivado'
				[Op.not]: [{status_registro_id: status}],
				// Que no esté capturado
				[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
				// Que esté en condiciones de ser capturado
				creado_en: {[Op.lt]: haceUnaHora},
			},
			include: includes,
		})
		.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad})) : ""));
};

let extraerPorStatus = (array, status) => {
	return array.length
		? array.filter((n) => n.status_registro_id == status)
		: []
};

let RCLVs_status = (RCLV, status) => {
	// Creado: status creado, con productos aprobados

	// Sin producto:
	//	- status creado, sin productos aprobados
	//	- status creado, sin productos creados

	return Productos.length
		? [
				Productos.filter((n) => n.status_registro_id == status.creado_id),
				Productos.filter((n) => n.status_registro_id == status.inactivar_id),
				Productos.filter((n) => n.status_registro_id == status.recuperar_id),
		  ]
		: ["", "", ""];
};
