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
	const linkDetalle = "/producto/detalle/?entidad=" + entidad + "&id=" + prodID;
	const vistaAnterior = req.session.urlAnterior;
	const includes = entidad == "capitulos" ? ["status_registro", "coleccion"] : "status_registro";
	const producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
	let informacion;

	// Funciones --------------------------------------------------------
	let problemasDeCaptura = () => {
		// Variables
		let informacion;
		// HorarioString
		let horarioString;
		if (producto.capturado_en) {
			let horarioCaptura = producto.capturado_en;
			horarioCaptura.setMinutes(horarioCaptura.getMinutes() + 1);
			horarioString =
				horarioCaptura.getDate() +
				"/" +
				meses[horarioCaptura.getMonth()] +
				" " +
				horarioCaptura.getHours() +
				":" +
				String(horarioCaptura.getMinutes()).padStart(2, "0");
		}
		// PROBLEMA 1: El producto está capturado por otro usuario en forma 'activa'
		if (
			producto.capturado_en &&
			producto.capturado_en > haceUnaHora &&
			producto.capturado_por_id != userID &&
			producto.captura_activa
		) {
			informacion = {
				mensajes: [
					"El producto está en revisión por el usuario " +
						producto.capturado_por.apodo +
						", desde el " +
						horarioString.slice(0, horarioString.indexOf(" ")) +
						" a las " +
						horarioString.slice(horarioString.indexOf(" ")) +
						"hs",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
					{
						nombre: "fa-house",
						link: "/",
						titulo: "Ir al 'Inicio'",
					},
				],
			};
		}
		// PROBLEMA 2: El usuario dejó inconclusa la revisión luego de la hora y no transcurrieron aún las 2 horas
		else if (
			producto.capturado_en &&
			producto.capturado_en < haceUnaHora &&
			producto.capturado_en > haceDosHoras &&
			producto.capturado_por_id == userID
		) {
			informacion = {
				mensajes: [
					"Esta revisión quedó inconclusa desde un poco antes del " +
						horarioString.slice(0, horarioString.indexOf(" ")) +
						" a las " +
						horarioString.slice(horarioString.indexOf(" ")) +
						"hs.. ",
					"Quedó a disposición de que lo continúe revisando otra persona.",
					"Si nadie lo revisa hasta 2 horas después de ese horario, podrás volver a revisarlo.",
				],
				iconos: [
					{
						nombre: "fa-spell-check",
						link: "/revision/tablero-de-control",
						titulo: "Ir al 'Tablero de Control' de Revisiones",
					},
				],
			};
		}
		// EL USUARIO PUEDE CAPTURAR EL REGISTRO --> SOLUCIONES
		// 1. Activar si no lo está, de lo contrario no hace nada
		else if (
			!producto.capturado_en ||
			!producto.captura_activa ||
			producto.capturado_por_id != userID ||
			producto.capturado_en < haceDosHoras
		) {
			let datos = {captura_activa: 1};
			// 2. Cambiar de usuario si estaba capturado por otro
			if (producto.capturado_por_id != userID) datos.capturado_por_id = userID;
			// 3. Fijarle la nueva hora de captura si corresponde
			if (producto.capturado_por_id != userID || producto.capturado_en < haceDosHoras)
				datos.capturado_en = funciones.ahora();
			// CAPTURA DEL REGISTRO
			BD_genericas.actualizarPorId(entidad, prodID, datos);
		}
		return informacion;
	};
	let statusCreado = () => {
		// Variables
		let informacion;
		// FOCO EN SU CREADOR
		// PROBLEMA 2: expiró la ventana de 1 hora
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
					iconos: [
						{
							nombre: "fa-circle-left",
							link: vistaAnterior,
							titulo: "Ir a la vista anterior",
						},
						{
							nombre: "fa-circle-info",
							link: linkDetalle,
							titulo: "Ir a la vista Detalle",
						},
					],
				};
		}
		// FOCO EN OTRA PERSONA
		// PROBLEMA 3: en este status, un usuario que no sea su creador no tiene permiso para acceder
		else {
			// No se puede acceder en este status
			informacion = {
				mensajes: [
					"El producto todavía no está aprobado.",
					"Está a disposición de nuestro equipo para su revisión.",
					"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
					{
						nombre: "fa-circle-info",
						link: linkDetalle,
						titulo: "Ir a la vista Detalle",
					},
				],
			};
		}
		return informacion;
	};
	let alta_aprobada = () => {
		let informacion
		if (codigo == "links") {
			// No se puede acceder en este status
			informacion = {
				mensajes: [
					"El producto todavía no está aprobado.",
					"Está a disposición de nuestro equipo para su revisión.",
					"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
				],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
					{
						nombre: "fa-circle-info",
						link: linkDetalle,
						titulo: "Ir a la vista Detalle",
					},
				],
			};
		}
		else if (codigo == "edicion") {
			// FOCO EN NO REVISORES
			// PROBLEMA 5: en este status, sólo los revisores pueden acceder
			if (!usuario.rol_usuario.aut_gestion_prod) {
				// No se puede acceder en este status
				informacion = {
					mensajes: [
						"El producto todavía no está aprobado.",
						"Está a disposición de nuestro equipo para su revisión.",
						"Una vez que esté revisado, si se aprueba podrás acceder a esta vista.",
					],
					iconos: [
						{
							nombre: "fa-circle-left",
							link: req.session.urlAnterior,
							titulo: "Ir a la vista anterior",
						},
						{
							nombre: "fa-circle-info",
							link: linkDetalle,
							titulo: "Ir a la vista Detalle",
						},
					],
				};
			}
			// FOCO EN REVISORES
			// PROBLEMAS DE CAPTURA
			else informacion = problemasDeCaptura(informacion);
		}
		return informacion;
	};

	// PROBLEMAS -----------------------------------------------------------
	// PROBLEMA 1: Registro no encontrado
	if (!producto) {
		informacion = {
			mensajes: ["Producto no encontrado"],
			iconos: [
				{nombre: "fa-circle-left", link: req.session.urlAnterior, titulo: "Ir a la vista anterior"},
			],
		};
	} else {
		// REGISTRO ENCONTRADO
		// FOCO SOLAMENTE EN 'EDICIÓN' Y 'LINKS'
		if (codigo == "edicion" || codigo == "links") {
			// FOCO EN STATUS APROBADO
			if (producto.status_registro.aprobado) {
				// PROBLEMA 2: solamente puede tener problemas de captura
				informacion = problemasDeCaptura(informacion);
			}
			// FOCO EN STATUS CREADO
			else if (producto.status_registro.creado) {
				// FOCO EN SU CREADOR	--> PROBLEMA 2: expiró la ventana de 1 hora
				// FOCO EN OTRA PERSONA	--> PROBLEMA 3: en este status, un usuario que no sea su creador no tiene permiso para acceder
				informacion = statusCreado(informacion);
			}
			// FOCO EN STATUS ALTA-APROBADA
			else if (producto.status_registro.alta_aprob) {
				// FOCO EN LINKS	--> PROBLEMA 4: en este status, nadie tiene permiso para acceder
				// FOCO EN EDICIÓN	--> PROBLEMA 5: en este status, sólo los revisores pueden acceder
				informacion = alta_aprobada(informacion);
			} else {
				// Mensaje para Inactivos
			}
		}
	}
	// Fin
	if (informacion) return res.render("Errores", {informacion});
	else next();
};
