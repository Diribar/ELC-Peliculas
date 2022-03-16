// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let BD_especificas = require("../../funciones/BD/especificas");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");

// *********** Controlador ***********
module.exports = {
	home: async (req, res) => {
		tema = "revision";
		codigo = "visionGeneral";
		// Obtener status a analizar
		let [creado_id, editado_id, aprobado_id, inactivar_id, recuperar_id, inactivado_id] =
			await BD_especificas.obtenerStatus();
		// Obtener Productos
		let includes = ["personaje", "hecho", "valor", "status_registro"];
		let peliculas = await BD_especificas.prodRevision("peliculas", includes);
		let colecciones = await BD_especificas.prodRevision("colecciones", includes);
		let Productos = [...peliculas, ...colecciones]
		//return res.send(peliculas);
		// Obtener los Productos según su estado
		let [productosCreado, productosEditado, productosInactivar, productosRecuperar] = Productos.length
			? [
					Productos.filter((n) => n.status_registro_id == statusCreado),
					Productos.filter((n) => n.status_registro_id == statusEditado),
					Productos.filter((n) => n.status_registro_id == statusInactivar),
					Productos.filter((n) => n.status_registro_id == statusRecuperar),
			  ]
			: ["", "", "", ""];
		return res.send(productosCreado);
		// Obtener RCLV
		// let personaje=await BD_varias.obtenerTodosPorCampo("")

		// Obtener Links

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
