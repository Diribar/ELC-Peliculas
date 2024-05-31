"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const {entidad, id, motivo_id, comentario} = {...req.query, ...req.body};
	const link = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
	let informacion;

	// Si no hay motivo, redirige
	if (!motivo_id)
		informacion = {
			mensajes: ["Necesitamos que nos digas el motivo"],
			iconos: [variables.vistaEntendido(link)],
		};

	// Si correspondía un comentario, redirige
	const motivo = motivosStatus.find((n) => n.id == motivo_id);
	if (motivo.agregarComent && !comentario)
		informacion = {
			mensajes: ["Necesitamos que nos des un comentario"],
			iconos: [variables.vistaEntendido(link)],
		};

	// Conclusiones
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
