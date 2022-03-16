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
		let peliculas = await BD_especificas.obtenerProductos("peliculas", includes, haceUnaHora, st);
		let colecciones = await BD_especificas.obtenerProductos("colecciones", includes, haceUnaHora, st);
		let Productos = [...peliculas, ...colecciones];
		// Obtener los productos en sus variantes a mostrar
		let prodCreado = extraerPorStatus(Productos, status.creado_id);
		let prodInactivar = extraerPorStatus(Productos, status.inactivar_id);
		let prodRecuperar = extraerPorStatus(Productos, status.recuperar_id);
		return res.send(prodCreado);
		// Obtener las ediciones en status 'edicion' --> PENDIENTE ----------------------

		// Obtener RCLV -----------------------------------------------------------------
		let personajes = await BD_especificas.obtenerRCLV("RCLV_personajes", haceUnaHora, status.aprobado_id);
		let hechos = await BD_especificas.obtenerRCLV("RCLV_hechos", haceUnaHora, status.aprobado_id);
		let valores = await BD_especificas.obtenerRCLV("RCLV_valores", haceUnaHora, status.aprobado_id);
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

let extraerPorStatus = (array, status) => {
	return array.length ? array.filter((n) => n.status_registro_id == status) : [];
};
