"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const procesosProd = require("../2.1-Prod-RUD/FN-Procesos");
const procesos = require("./FN-Procesos");

// *********** Controlador ***********
module.exports = {
	linksForm: async (req, res) => {
		// DETALLE - ABM
		// Tema y Código
		const tema = "links_crud";
		const codigo = "links";
		// Obtener los datos identificatorios del producto y del usuario
		let prodEntidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtener los datos ORIGINALES y EDITADOS del producto
		let [prodOriginal, prodEditado] = await procesosProd.obtenerVersionesDelProducto(
			prodEntidad,
			prodID,
			userID
		);
		// Obtener el avatar
		let avatar = compartidas.nombreAvatar(prodOriginal,prodEditado)
		// Combinar los datos Editados con la versión Original
		let producto = {...prodOriginal, ...prodEditado};
		// Obtener información de BD
		let links = await procesos.obtenerLinksActualizados(prodEntidad, prodID, userID);
		let provs = await BD_genericas.obtenerTodos("links_provs", "orden");
		let linksTipos = await BD_genericas.obtenerTodos("links_tipos", "id");
		// Separar entre 'gr_activos' y 'gr_inactivos'
		// Configurar el producto, el título
		let prodNombre = compartidas.obtenerEntidadNombre(prodEntidad);
		let titulo = "ABM de Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtener datos para la vista
		if (prodEntidad == "capitulos") {
			let coleccion_id =
				prodEditado && prodEditado.coleccion_id
					? prodEditado.coleccion_id
					: prodOriginal.coleccion_id;
			let temporada =
				prodEditado && prodEditado.temporada ? prodEditado.temporada : prodOriginal.temporada;
			producto.capitulos = await BD_especificas.obtenerCapitulos(coleccion_id, temporada);
		}
		let motivos = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden")
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		// Va a la vista
		//return res.send(links);
		return res.render("CR0-0Estructura", {
			tema,
			codigo,
			entidad: prodEntidad,
			prodID,
			userID,
			titulo,
			links,
			provs,
			producto,
			links_tipos: linksTipos,
			vista: req.baseUrl + req.path,
			avatar,
			calidades: [144, 240, 360, 480, 720, 1080],
			motivos,
		});
	},
};
