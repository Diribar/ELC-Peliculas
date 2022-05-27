"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const status = req.session.status_registro;
	let informacion;
	// Variables - Registro
	const includes = ["links", "links_edic"];
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaTablero = variables.vistaTablero();
	const vistaRudLinks = {
		nombre: "fa-link",
		link: "/producto_rud/links/?entidad=" + entidad + "&id=" + prodID,
		titulo: "Ir a la 'Edición de Links'",
	};

	// Averiguar si alguno de los links es del usuario revisor
	if (registro.links.length)
		// PROBLEMA: creado o editado o cambio_status_propuesto por el usuario
		for (let link of registro.links) {
			if (link.creado_por_id == userID) {
				informacion = {
					mensajes: ["El producto tiene por lo menos algún link 'creado' por vos."],
				};
			}

			if (link.cambio_status_propuesto_por_id == userID)
				informacion = {
					mensajes: [
						"El producto tiene por lo menos algún link 'con cambio de status' sugerido por vos.",
					],
				};
			if (informacion) {
				break;
			}
		}
	if (!informacion && registro.links_edic.length)
		for (let link of registro.links_edic)
			if (link.editado_por_id == userID) {
				informacion = {
					mensajes: ["El producto tiene por lo menos algún link 'editado' por vos."],
				};
				break;
			}
	// Si hay errores, los informa

	if (informacion) {
		informacion.mensajes.push(
			"En estas condiciones, necesitamos que otra persona revise los links de este producto."
		);
		informacion.iconos = [vistaAnterior, vistaTablero, vistaRudLinks];
		return res.render("Errores", {informacion});
	}

	// Continuar
	next();
};
