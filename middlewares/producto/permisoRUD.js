"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = async (req, res, next) => {
	// Variables - Generales
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const userID = req.session.usuario.id;
	const aut_gestion_prod = req.session.usuario.rol_usuario.aut_gestion_prod;
	const url = req.url.slice(1);
	const codigo = url.slice(0, url.indexOf("/"));
	const haceUnaHora = funciones.haceUnaHora();
	const haceDosHoras = funciones.haceDosHoras();
	let informacion;
	// Variables - Producto
	let includes = ["status_registro"];
	if (entidad == "capitulos") includes.push("coleccion");
	const producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	let capturado_en = producto.capturado_en;
	if (capturado_en) capturado_en.setSeconds(0);
	// Variables - Vistas
	const vistaAnterior = {
		nombre: "fa-circle-left",
		link: req.session.urlAnterior,
		titulo: "Ir a la vista anterior",
	};
	const vistaDetalle = {
		nombre: "fa-circle-info",
		link: "/producto/detalle/?entidad=" + entidad + "&id=" + prodID,
		titulo: "Ir a la vista Detalle",
	};
	const prohibidoAccederEnEseStatus = [
		"El producto todavía no está aprobado.",
		"Está a disposición de nuestro equipo para su revisión.",
		"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
	];

	// Funciones --------------------------------------------------------
	let statusCreado = () => {
		// Variables
		let informacion;
		// FOCO EN SU CREADOR --> PROBLEMA 1: expiró la ventana de 1 hora
		// ¿Creado por el usuario actual?
		let creadoPorElUsuario1 = producto.creado_por_id == userID;
		let creadoPorElUsuario2 = entidad == "capitulos" && producto.coleccion.creado_por_id == userID;
		if (creadoPorElUsuario1 || creadoPorElUsuario2) {
			// ¿Creado < haceUnaHora?
			if (producto.creado_en < haceUnaHora)
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
		if (capturado_en) {
			// Configurar el horario inicial
			let horarioInicial = new Date(capturado_en);
			// Configurar el horario final
			let horarioFinal = horarioInicial;
			horarioFinal.setHours(horarioInicial.getHours() + 1);
			// Configurar los horarios con formato texto
			horarioInicial = funciones.horarioTexto(horarioInicial);
			horarioFinal = funciones.horarioTexto(horarioFinal);
			// PROBLEMA 1: El producto está capturado por otro usuario en forma 'activa'
			if (
				capturado_en > haceUnaHora &&
				producto.capturado_por_id != userID &&
				producto.captura_activa
			) {
				informacion = {
					mensajes: [
						"El producto está siendo revisado por otro usuario desde el " + horarioInicial,
					],
					iconos: [vistaAnterior, vistaDetalle],
				};
			}
			// EL PRODUCTO NO ESTÁ CAPTURADO POR OTRO USUARIO EN FORMA ACTIVA
			// PROBLEMA 2: El usuario dejó inconclusa la edición luego de la hora de captura, y no transcurrieron aún las 2 horas
			else if (
				capturado_en < haceUnaHora &&
				capturado_en > haceDosHoras &&
				producto.capturado_por_id == userID
			) {
				informacion = {
					mensajes: [
						"Dejaste capturada esta entidad desde el " + horarioFinal,
						"Quedó a disposición del equipo de revisores.",
						"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás retomar esta tarea.",
					],
					iconos: [vistaAnterior, vistaDetalle],
				};
			}
		}
		// SI NO HAY INFORMACIÓN, ENTONCES EL USUARIO PUEDE CAPTURAR EL PRODUCTO
		if (!informacion) await funciones.activarCapturaSiNoLoEsta(producto);
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

	// PROBLEMAS -----------------------------------------------------------
	// PROBLEMA: Registro no encontrado
	if (!producto) {
		informacion = {
			mensajes: ["Producto no encontrado"],
			iconos: [vistaAnterior],
		};
	} else {
		// REGISTRO ENCONTRADO
		// FOCO SOLAMENTE EN 'EDICIÓN' Y 'LINKS'
		if (codigo == "edicion" || codigo == "links") {
			// FOCO EN STATUS CREADO
			if (producto.status_registro.creado) {
				// FOCO EN SU CREADOR	--> PROBLEMA 1: expiró la ventana de 1 hora
				// FOCO EN OTRA PERSONA	--> PROBLEMA 2: en este status, un usuario que no sea su creador no tiene permiso para acceder
				informacion = statusCreado(informacion);
			}
			// FOCO EN STATUS ALTA-APROBADA
			else if (producto.status_registro.alta_aprob) {
				// FOCO EN LINKS	--> PROBLEMA 1: en este status, nadie tiene permiso para acceder
				// FOCO EN EDICIÓN	--> PROBLEMA 2: en este status, sólo los revisores pueden acceder
				informacion = await alta_aprobada(informacion);
			}
			// FOCO EN STATUS APROBADO
			else if (producto.status_registro.aprobado) {
				// PROBLEMA: solamente puede tener problemas de captura y si no los tiene, hace la captura
				informacion = await problemasDeCaptura(informacion);
			} else {
				// Mensaje para Inactivos
			}
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	else next();
};
