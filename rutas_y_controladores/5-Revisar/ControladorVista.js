// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");
let varias = require("../../funciones/Varias/Varias");

// *********** Controlador ***********
module.exports = {
	home: async (req, res) => {
		tema = "revision";
		codigo = "visionGeneral";
		// Obtener status a analizar
		let [creado_id, , aprobado_id, inactivar_id, recuperar_id, inactivado_id] =
			await BD_especificas.obtenerStatus();
		// Fijar el horario de corte
		let haceUnaHora = varias.funcionHaceUnaHora();
		// Obtener Productos -------------------------------------------------------------
		let includes = ["personaje", "hecho", "valor", "status_registro"];
		let peliculas = await BD_especificas.obtenerTodos_Revision("peliculas", includes, haceUnaHora);
		let colecciones = await BD_especificas.obtenerTodos_Revision("colecciones", includes, haceUnaHora);
		let Productos = [...peliculas, ...colecciones];
		//return res.send(peliculas);
		// Obtener los Productos según su estado
		let [productosCreado, productosInactivar, productosRecuperar] = Productos.length
			? [
					Productos.filter((n) => n.status_registro_id == creado_id),
					Productos.filter((n) => n.status_registro_id == inactivar_id),
					Productos.filter((n) => n.status_registro_id == recuperar_id),
			  ]
			: ["", "", ""];
		//return res.send(productosCreado);
		// Obtener las ediciones en status 'edicion' --> PENDIENTE
		// Obtener RCLV -----------------------------------------------------------------
		let personajes = await BD_especificas.obtenerTodos_Revision("RCLV_personajes", "");
		let hechos = await BD_especificas.obtenerTodos_Revision("RCLV_hechos", "");
		let valores = await BD_especificas.obtenerTodos_Revision("RCLV_valores", "");
		let RCLV = [...personajes, ...hechos, ...valores];
		//return res.send(RCLV);
		// Obtener Links ----------------------------------------------------------------

		// Ir a la vista
		return res.send("Revisar");
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			productosCreado,
			productosEditado,
			productosInactivar,
			productosRecuperar,
		});
	},
};
