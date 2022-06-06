"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Definir variables
	let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", req.session.usuario.id);
	let informacion;

	// VERIFICACIÓN1: Usuario penalizado
	if (!informacion) informacion = usuarioPenalizado(usuario);
	// VERIFICACIÓN2: Registros a revisar >= Nivel de Confianza
	if (!informacion) informacion = await compararRegistrosConNivelDeConfianza(req, usuario);

	// Continuar
	if (informacion) return res.render("Errores", {informacion});
	next();
};

let usuarioPenalizado = (usuario) => {
	let informacion;
	if (new Date(usuario.penalizado_hasta) > funciones.ahora())
		informacion = {
			mensajes: ["Según la información que tenemos, no estás habilitado aún para realizar esta tarea."],
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio()],
		};
	return informacion;
};

let compararRegistrosConNivelDeConfianza = async (req, usuario) => {
	// Variables
	let informacion;
	// Obtener el url
	let url = req.url.slice(1);
	url = url.slice(0, url.indexOf("/"));
	// Obtener el urlBase
	const urlBase = req.baseUrl;
	// Obtener la tarea
	const producto = (urlBase == "producto_rud" && url == "links") || urlBase == "/producto_agregar";
	const edicion = urlBase == "producto_rud" && url == "edicion";
	// Obtener su nivel de confianza
	const aprob = edicion ? usuario.edic_aprob : producto ? usuario.altas_prod_aprob : 0;
	const rech = url == edicion ? usuario.edic_rech : producto ? usuario.altas_prod_rech : 0;
	const cantMinima = parseInt(process.env.cantMinima);
	const cantStartUp = parseInt(process.env.cantStartUp);
	const acelerador = parseInt(process.env.acelerador);
	const startUpVigente = cantStartUp - aprob - rech;
	const cantDesempeno = aprob - rech + acelerador;
	const nivelDeConfianza = Math.max(cantMinima, startUpVigente, cantDesempeno);
	// Varias

	// Variables
	let contarRegistros = 0;
	if (producto)
		contarRegistros = await BD_especificas.productosConStatusARevisar(
			usuario.id,
			req.session.status_registro
		);
	// Si la cantidad de registros es mayor o igual --> Error
	const mensajes = producto
		? [
				"Gracias por los registros agregados anteriormente.",
				"Queremos analizarlos, antes de que sigas agregando otros.",
				"En cuanto los hayamos analizado, te habilitaremos para que ingreses más.",
				"La cantidad autorizada irá aumentando a medida que tus propuestas sean aprobadas.",
		  ]
		: [
				"Gracias por los ediciones sugeridas anteriormente.",
				"Queremos analizarlas, antes de que sigas editando otros registros.",
				"En cuanto los hayamos analizado, te habilitaremos para que edites más.",
				"La cantidad autorizada irá aumentando a medida que tus propuestas sean aprobadas.",
		  ];
	if (contarRegistros >= nivelDeConfianza)
		informacion = {
			mensajes: mensajes,
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio()],
		};
	return informacion;
};
