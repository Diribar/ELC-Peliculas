"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesar = require("../../funciones/3-Procesos/3-RUD");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../../funciones/4-Validaciones/RUD");

// *********** Controlador ***********
module.exports = {
	linksForm: async (req, res) => {
		// DETALLE - ABM
		// Tema y Código
		let tema = "links_rud";
		let codigo = "links";
		// Obtener los datos identificatorios del producto y del usuario
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await procesar.obtenerVersionesDelProducto(entidad, prodID, userID);
		// Obtener el avatar
		let avatar = prodEditado.avatar
			? "/imagenes/3-ProdRevisar/" + prodEditado.avatar
			: prodOriginal.avatar
			? prodOriginal.avatar.slice(0, 4) != "http"
				? "/imagenes/2-Productos/" + prodOriginal.avatar
				: prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// Combinar los datos Editados con la versión Original
		let producto = {...prodOriginal, ...prodEditado};
		// Obtener información de BD
		let links = await procesar.obtenerLinksActualizados(entidad, prodID, userID);
		let provs = await BD_genericas.obtenerTodos("links_proveedores", "orden");
		let linksTipos = await BD_genericas.obtenerTodos("links_tipos", "id");
		// Separar entre 'gr_activos' y 'gr_inactivos'
		// Configurar el producto, el título
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
		let titulo = "ABM de Links de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtener datos para la vista
		if (entidad == "capitulos") {
			let coleccion_id =
				prodEditado && prodEditado.coleccion_id
					? prodEditado.coleccion_id
					: prodOriginal.coleccion_id;
			let temporada =
				prodEditado && prodEditado.temporada ? prodEditado.temporada : prodOriginal.temporada;
			producto.capitulos = await BD_especificas.obtenerCapitulos(coleccion_id, temporada);
		}
		let dataEntry = req.session.links ? req.session.links : "";
		let motivos = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden")
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		// Ir a la vista
		//return res.send(links);
		return res.render("0-Estructura-CRUD", {
			tema,
			codigo,
			entidad,
			prodID,
			userID,
			titulo,
			links,
			provs,
			producto,
			links_tipos: linksTipos,
			vista: req.baseUrl + req.path,
			dataEntry,
			avatar,
			calidades: [144, 240, 360, 480, 720, 1080],
			motivos,
		});
	},
	linksGuardar: async (req, res) => {
		// Variables
		let datos = req.body;
		let userID = req.session.usuario.id;
		// Averiguar si hay errores de validación
		let errores = await validar.links(datos);
		if (errores.hay) req.session.links = datos;
		else {
			// Procesar los datos en la operación que corresponda
			datos.alta
				? await procesar.altaDeLink(req, datos)
				: await procesar.guardarEdicionDeLink(userID, datos);
			delete req.session.links;
		}
		// Redireccionar
		return res.redirect("/links/abm/?entidad=" + datos.prodEntidad + "&id=" + datos.prodID);
	},
	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
