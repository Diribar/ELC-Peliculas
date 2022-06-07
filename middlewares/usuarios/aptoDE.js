"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Definir variables
	const usuario = await BD_genericas.obtenerPorId("usuarios", req.session.usuario.id);
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaInicio = variables.vistaInicio();
	let informacion;

	// Fórmulas
	let usuarioPenalizado = () => {
		let informacion;
		if (usuario.penalizado_hasta && new Date(usuario.penalizado_hasta) > funciones.ahora())
			informacion = {
				mensajes: [
					"Según la información que tenemos, no estás habilitado aún para realizar esta tarea.",
				],
				iconos: [vistaAnterior, vistaInicio],
			};
		return informacion;
	};
	let compararRegistrosConNivelDeConfianza = async () => {
		// Variables
		let informacion;
		// Obtener datos del url
		const urlBase = req.baseUrl;
		const originalUrl = req.originalUrl;
		const status = req.session.status_registro;
		// Obtener la tarea
		const producto = urlBase == "/producto_agregar";
		const rclv = urlBase == "/rclv";
		const links = originalUrl.startsWith("/producto_rud/links");
		const edicion = originalUrl.startsWith("/producto_rud/edicion");
		// Obtener su nivel de confianza
		const nivelDeConfianza = nivel_de_confianza(usuario, producto, rclv, links, edicion);
		// Contar registros
		const contarRegistros = contar_registros(usuario, producto, rclv, links, edicion, status);

		// Si la cantidad de registros es mayor o igual que el nivel de confianza --> Error
		if (contarRegistros >= nivelDeConfianza)
			informacion = {
				mensajes: mensajes(edicion),
				iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio()],
			};
		// Fin
		return informacion;
	};

	// VERIFICACIÓN1: Usuario penalizado
	if (!informacion) informacion = usuarioPenalizado();
	// VERIFICACIÓN2: Registros a revisar >= Nivel de Confianza
	if (!informacion) informacion = await compararRegistrosConNivelDeConfianza();

	// Continuar
	if (informacion) return res.render("Errores", {informacion});
	next();
};

let nivel_de_confianza = (usuario, producto, rclv, links, edicion) => {
	// Obtener la cantidad de aprobaciones
	const aprob = producto
		? usuario.altas_prod_aprob
		: rclv
		? usuario.altas_rclv_aprob
		: links
		? usuario.altas_link_aprob
		: edicion
		? usuario.edic_aprob
		: 0;
	// Obtener la cantidad de rechazos
	const rech = producto
		? usuario.altas_prod_rech
		: rclv
		? usuario.altas_rclv_rech
		: links
		? usuario.altas_link_rech
		: edicion
		? usuario.edic_rech
		: 0;
	// Preparar los parámetros
	const cantMinima = parseInt(process.env.cantMinima);
	const acelerador = parseInt(process.env.acelerador);
	const cantDesempeno = aprob - rech + acelerador;
	// Obtener el nivel de confianza
	const nivelDeConfianza = Math.max(cantMinima, cantDesempeno);
	// Fin
	return nivelDeConfianza;
};
let contar_registros = async (usuario, producto, rclv, links, edicion, status) => {
	// Contar registros
	let contarRegistros = 0;
	// Contar registros con status 'a revisar'
	if (producto) {
		const entidades = ["peliculas", "colecciones", "capitulos"];
		contarRegistros = await BD_especificas.registrosConStatusARevisar(usuario.id, status, entidades);
	} else if (rclv) {
		const entidades = ["personajes", "hechos", "valores"];
		contarRegistros = await BD_especificas.registrosConStatusARevisar(usuario.id, status, entidades);
	} else if (links) {
		const entidades = ["links_originales"];
		contarRegistros = await BD_especificas.registrosConStatusARevisar(usuario.id, status, entidades);
	}
	// Contar registros de edición
	else if (edicion) contarRegistros = await BD_especificas.registrosConEdicion(usuario.id);
	// Fin
	return contarRegistros;
};
let mensajes = (edicion) => {
	return edicion
		? [
				"Gracias por los ediciones sugeridas anteriormente.",
				"Queremos analizarlas, antes de que sigas editando otros registros.",
				"En cuanto los hayamos analizado, te habilitaremos para que edites más.",
				"La cantidad autorizada irá aumentando a medida que tus propuestas sean aprobadas.",
		  ]
		: [
				"Gracias por los registros agregados anteriormente.",
				"Queremos analizarlos, antes de que sigas agregando otros.",
				"En cuanto los hayamos analizado, te habilitaremos para que ingreses más.",
				"La cantidad autorizada irá aumentando a medida que tus propuestas sean aprobadas.",
		  ];
};
