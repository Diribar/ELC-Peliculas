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
	const aut_gestion_prod = req.session.usuario.rol_usuario.aut_gestion_prod;
	const url = req.url.slice(1);
	const codigo = url.slice(0, url.indexOf("/"));
	const haceUnaHora = funciones.haceUnaHora();
	let informacion;
	// Variables - Producto
	let includes = ["status_registro"];
	if (entidad == "capitulos") includes.push("coleccion");
	const registro = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	let capturado_en = registro.capturado_en;
	if (capturado_en) capturado_en.setSeconds(0);
	const [horarioInicial, horarioFinal] = funciones.horariosCaptura(capturado_en);
	// Variables - Vistas
	const vistaAnterior = variables.vistaAnterior(req.session.urlAnterior);
	const vistaDetalle = {
		nombre: "fa-circle-info",
		link: "/producto_rud/detalle/?entidad=" + entidad + "&id=" + prodID,
		titulo: "Ir a la vista Detalle",
	};
	const prohibidoAccederEnEseStatus = [
		"El registro todavía no está aprobado.",
		"Está a disposición de nuestro equipo para su revisión.",
		"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
	];

	// Funciones --------------------------------------------------------
	let statusCreado = () => {
		// Variables
		let informacion;
		// FOCO EN SU CREADOR --> PROBLEMA 1: expiró la ventana de 1 hora
		// ¿Creado por el usuario actual?
		let creadoPorElUsuario1 = registro.creado_por_id == userID;
		let creadoPorElUsuario2 = entidad == "capitulos" && registro.coleccion.creado_por_id == userID;
		if (creadoPorElUsuario1 || creadoPorElUsuario2) {
			// ¿Creado < haceUnaHora?
			if (registro.creado_en < haceUnaHora)
				informacion = {
					mensajes: [
						"Expiró el tiempo de edición.",
						"Está a disposición de nuestro equipo para su revisión.",
					],
					iconos: [vistaAnterior, vistaDetalle],
				};
		}
		// FOCO EN OTRA PERSONA --> PROBLEMA 2: en este status, nadie más tiene permiso para acceder
		else {
			// No se puede acceder en este status
			informacion = {
				mensajes: prohibidoAccederEnEseStatus,
				iconos: [vistaAnterior, vistaDetalle],
			};
		}
		return informacion;
	};
	let problemasDeCaptura = async () => {
		// DETECTAR PROBLEMAS DE CAPTURA
		// PROBLEMA 1: El registro está capturado por otro usuario en forma 'activa'
		let infoProblema1 = {
			mensajes: ["El registro está siendo revisado por otro usuario desde el " + horarioInicial],
			iconos: [vistaAnterior, vistaDetalle],
		};
		// PROBLEMA 2: El usuario dejó inconclusa la edición luego de la hora de captura, y no transcurrieron aún las 2 horas
		let infoProblema2 = {
			mensajes: [
				"Este registro quedó a disposición del equipo de revisores, desde el " + horarioFinal,
				"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás retomar esta tarea.",
			],
			iconos: [vistaAnterior, vistaDetalle],
		};
		// Conclusión
		informacion = funciones.detectarProblemasDeCaptura(
			informacion,
			infoProblema1,
			infoProblema2,
			capturado_en,
			registro,
			userID
		);
		// Fin
		return informacion;
	};
	let alta_aprobada = async () => {
		let informacion;
		if (codigo == "links") {
			// FOCO EN LINKS --> PROBLEMA 1: en este status, nadie tiene permiso para acceder
			informacion = {
				mensajes: prohibidoAccederEnEseStatus,
				iconos: [vistaAnterior, vistaDetalle],
			};
		} else if (codigo == "edicion") {
			// FOCO EN EDICIÓN --> PROBLEMA 2: en este status, sólo los revisores pueden acceder
			if (!aut_gestion_prod) {
				// No se puede acceder en este status
				informacion = {
					mensajes: prohibidoAccederEnEseStatus,
					iconos: [vistaAnterior, vistaDetalle],
				};
			}
			// FOCO EN REVISORES
			// PROBLEMAS DE CAPTURA
			else informacion = await problemasDeCaptura();
		}
		return informacion;
	};

	// FOCO EN STATUS CREADO
	if (registro.status_registro.creado) {
		// FOCO EN SU CREADOR	--> PROBLEMA 1: expiró la ventana de 1 hora
		// FOCO EN OTRA PERSONA	--> PROBLEMA 2: en este status, sólo su creador tiene permiso para acceder
		informacion = statusCreado(informacion);
	}
	// FOCO EN STATUS ALTA-APROBADA
	else if (registro.status_registro.alta_aprob) {
		// FOCO EN LINKS	--> PROBLEMA 1: en este status, nadie tiene permiso para acceder
		// FOCO EN EDICIÓN	--> PROBLEMA 2: en este status, sólo los revisores pueden acceder
		informacion = await alta_aprobada(informacion);
	}
	// FOCO EN STATUS APROBADO
	else if (registro.status_registro.aprobado) {
		// PROBLEMA: solamente puede tener problemas de captura
		informacion = await problemasDeCaptura(informacion);
	} else {
		// Mensaje para Inactivos
	}

	// Fin
	if (informacion) return res.render("Errores", {informacion});

	// Continuar
	next();
};
