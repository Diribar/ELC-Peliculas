"use strict";
// ************ Requires ************
const BD_varias = require("../../funciones/BD/varias");
const BD_especificas = require("../../funciones/BD/especificas");
const varias = require("../../funciones/Varias/Varias");

module.exports = {
	visionGeneral: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let codigo = "visionGeneral";
		// Definir variables
		let status = await BD_varias.obtenerTodos("status_registro_ent", "orden");
		let revisar = status.filter((n) => !n.revisado).map((n) => n.id);
		let userID = req.session.usuario.id;
		let haceUnaHora = varias.haceUnaHora();
		// Obtener Productos ------------------------------------------------------------
		let Productos = await BD_especificas.obtenerProductos(haceUnaHora, revisar, userID);
		// Obtener las ediciones en status 'edicion' --> PENDIENTE
		// Consolidar Productos y ordenar
		Productos = procesar(Productos);
		// Obtener RCLV -----------------------------------------------------------------
		// Obtener Links ----------------------------------------------------------------
		let links = await BD_especificas.obtenerLinks(haceUnaHora, revisar, userID);
		// Obtener los productos de los links
		let aprobado = status.filter((n) => n.aprobado).map((n) => n.id);
		let prodsLinks = productosLinks(links, aprobado);
		// Ir a la vista ----------------------------------------------------------------
		//return res.send(Productos);
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			Productos,
			RCLVs: [],
			prodsLinks,
			status,
		});
	},

	producto: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.indexOf("/"));
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await BD_especificas.obtenerVersionesDeProducto(
			entidad,
			prodID,
			userID
		);
		// Obtener avatar
		let imagen = prodEditado.avatar;
		let avatar = imagen ? "/imagenes/3-ProdRevisar/" + imagen : "/imagenes/8-Agregar/IM.jpg";
		// Obtener los países
		let paises = prodOriginal.paises_id ? await varias.paises_idToNombre(prodOriginal.paises_id) : "";
		// Configurar el título de la vista
		let entidadNombre = varias.entidadNombre(entidad);
		let titulo = "Revisión de" + (entidad == "capitulos" ? "l " : " la ") + entidadNombre;
		// Información complementaria

	},
};

// Funciones ------------------------------------------------------------------------------
