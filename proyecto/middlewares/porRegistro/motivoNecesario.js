"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const entidad = comp.obtieneEntidadDesdeUrl(req);
	const {id, motivo_id, comentario, entDupl, idDupl} = {...req.params, ...req.body};
	const link = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
	let mensajes, motivo;

	// Si no hay motivo, redirige
	if (!mensajes && !motivo_id) mensajes = ["Necesitamos que nos digas el motivo"];

	// Si no se reconoce el motivo, redirige
	if (!mensajes) {
		motivo = statusMotivos.find((n) => n.id == motivo_id);
		if (!motivo) mensajes = ["No reconocemos ese motivo"];
	}

	// Si el motivo es 'duplicado', se fija si se informó la 'entidad' y el 'id'
	if (!mensajes && motivo_id == motivoDupl_id) {
		if (!entDupl && !idDupl)
			mensajes = ["Necesitamos que nos informes la entidad y el id del producto con el que está duplicado"];
		else if (!entDupl) mensajes = ["Necesitamos que nos informes la entidad del producto con el que está duplicado"];
		else if (!idDupl) mensajes = ["Necesitamos que nos informes el id del producto con el que está duplicado"];
		else {
			const producto = await baseDeDatos.obtienePorId(entDupl, idDupl);
			if (!producto) mensajes = ["No tenemos ningún producto con esa combinación de entidad e id"];
		}
	}

	// Si correspondía un comentario y no se completó, redirige
	if (!mensajes && motivo.comentNeces) {
		if (!comentario) mensajes = ["Necesitamos que nos des un comentario"];
		if (!mensajes && comentario.length > largoComentario) ["Necesitamos un comentario más corto"];
	}
	if (!mensajes && !motivo.comentNeces) delete req.body.comentario;

	// Si corresponde, muestra el mensaje
	if (mensajes) return res.render("CMP-0Estructura", {informacion: {mensajes, iconos: [variables.vistaEntendido(link)]}});

	// Fin
	return next();
};
