"use strict";
// Requires
const funciones = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	const entidad = req.query.entidad;
	const prodID = req.query.id;
	const usuario = req.session.usuario;
	const userID = usuario.id;
	const url = req.url.slice(1);
	const codigo = url.slice(0, url.indexOf("/"));
	const haceUnaHora = funciones.haceUnaHora();
	const haceDosHoras = funciones.haceDosHoras();
	const vistaDetalle = {
		nombre: "fa-circle-info",
		link: "/producto/detalle/?entidad=" + entidad + "&id=" + prodID,
		titulo: "Ir a la vista Detalle",
	};
	const vistaAnterior = {
		nombre: "fa-circle-left",
		link: req.session.urlAnterior,
		titulo: "Ir a la vista anterior",
	};
	const prohibidoAccederEnEseStatus = [
		"El producto todavía no está aprobado.",
		"Está a disposición de nuestro equipo para su revisión.",
		"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
	];
	const includes = entidad == "capitulos" ? ["status_registro", "coleccion"] : "status_registro";
	const producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	let capturado_en = producto.capturado_en;
	if (capturado_en) capturado_en.setSeconds(0);
	let informacion;

	// Funciones --------------------------------------------------------
	let horarioTexto = () => {
		// Funciones
		let texto = (horario) => {
			return (
				horario.getDate() +
				"/" +
				meses[horario.getMonth()] +
				" " +
				horario.getHours() +
				":" +
				String(horario.getMinutes()).padStart(2, "0")
			);
		};
		// Configurar el horario inicial
		let horarioInicial = new Date(capturado_en);
		// Configurar el horario final
		let horarioFinal = horarioInicial;
		horarioFinal.setHours(horarioInicial.getHours() + 1);
		// Convertir a string
		horarioInicial = texto(horarioInicial);
		horarioFinal = texto(horarioFinal);
		// Límite entre la fecha y la hora
		let limiteInicial = horarioInicial.indexOf(" ");
		let limiteFinal = horarioInicial.indexOf(" ");
		// Fin
		return [horarioInicial, horarioFinal, limiteInicial, limiteFinal];
	};
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
	let problemasDeCaptura = () => {
		// PROBLEMAS DE CAPTURA
		if (capturado_en) {
			let [horarioInicial, horarioFinal, limiteInicial, limiteFinal] = horarioTexto();
			// PROBLEMA 1: El producto está capturado por otro usuario en forma 'activa'
			if (
				capturado_en > haceUnaHora &&
				producto.capturado_por_id != userID &&
				producto.captura_activa
			) {
				informacion = {
					mensajes: [
						"El producto está siendo revisado por otro usuario desde el " +
							horarioInicial.slice(0, limiteInicial) +
							" a las " +
							horarioInicial.slice(limiteInicial) +
							"hs",
					],
					iconos: [vistaAnterior, vistaDetalle],
				};
			}
			// PROBLEMA 2: El usuario dejó inconclusa la edición luego de la hora de captura, y no transcurrieron aún las 2 horas
			else if (
				capturado_en < haceUnaHora &&
				capturado_en > haceDosHoras &&
				producto.capturado_por_id == userID
			) {
				informacion = {
					mensajes: [
						"Esta edición quedó inconclusa desde el " +
							horarioFinal.slice(0, limiteFinal) +
							" a las " +
							horarioFinal.slice(limiteFinal) +
							"hs.. ",
						"Quedó a disposición del equipo de revisores.",
						"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás retomar la edición.",
					],
					iconos: [vistaAnterior, vistaDetalle],
				};
			}
		}
		// CAPTURA DEL REGISTRO
		// SOLUCIÓN 1: activa la entidad si no lo está, de lo contrario no hace nada
		if (
			!capturado_en ||
			!producto.captura_activa ||
			producto.capturado_por_id != userID ||
			capturado_en < haceDosHoras
		) {
			let datos = {captura_activa: true};
			// SOLUCIÓN 2:.cambia de usuario si estaba capturado por otro
			if (producto.capturado_por_id != userID) datos.capturado_por_id = userID;
			// SOLUCIÓN 3: fijar la nueva hora de captura si corresponde
			if (producto.capturado_por_id != userID || capturado_en < haceDosHoras)
				datos.capturado_en = funciones.ahora();
			// CAPTURA DEL REGISTRO
			BD_genericas.actualizarPorId(entidad, prodID, datos);
		}
		return informacion;
	};
	let alta_aprobada = () => {
		let informacion;
		if (codigo == "links") {
			// FOCO EN LINKS --> PROBLEMA 1: en este status, nadie tiene permiso para acceder
			informacion = {
				mensajes: prohibidoAccederEnEseStatus,
				iconos: [vistaAnterior, vistaDetalle],
			};
		} else if (codigo == "edicion") {
			// FOCO EN EDICIÓN --> PROBLEMA 2: en este status, sólo los revisores pueden acceder
			if (!usuario.rol_usuario.aut_gestion_prod) {
				// No se puede acceder en este status
				informacion = {
					mensajes: prohibidoAccederEnEseStatus,
					iconos: [vistaAnterior, vistaDetalle],
				};
			}
			// FOCO EN REVISORES
			// PROBLEMAS DE CAPTURA
			else informacion = problemasDeCaptura();
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
				informacion = alta_aprobada(informacion);
			}
			// FOCO EN STATUS APROBADO
			else if (producto.status_registro.aprobado) {
				// PROBLEMA: solamente puede tener problemas de captura y si no los tiene, hace la captura
				informacion = problemasDeCaptura(informacion);
			} else {
				// Mensaje para Inactivos
			}
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	else next();
};
