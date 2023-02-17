"use strict";
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = (req, res, next) => {
	// Variables
	const id = req.query.id;

	let informacion;
	// Bloquea el acceso a los ID menores que 10
	if (id && id < 10)
		informacion = {
			mensajes: ["El acceso para este registro está bloqueado por los administradores."],
			iconos: [
				{
					nombre: "fa-circle-left",
					link: req.session.urlAnterior,
					titulo: "Ir a la vista anterior",
				},
			],
		};
	// Bloquea la edición de los ID menores que 20
	else if (req.originalUrl.includes("/edicion/") && id && id < 20)
		informacion = {
			mensajes: [
				"Este registro es de alta sensibilidad.",
				"Su acceso para editarlo está bloqueado por los administradores.",
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
