"use strict";
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = (req, res, next) => {
	// Variables
	const entidad = req.query.entidad;
	const id = req.query.id;
	const entidades = variables.entidadesRCLV;
	let informacion;
	// Verificar los datos
	if (entidades.includes(entidad) && id < 20)
		informacion = {
			mensajes: [
				"El acceso para este registro está bloqueado por los administradores."
			],
			iconos: [
				{
					nombre: "fa-circle-left",
					link: req.session.urlAnterior,
					titulo: "Ir a la vista anterior",
				},
			],
		};

	// Conclusiones
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
