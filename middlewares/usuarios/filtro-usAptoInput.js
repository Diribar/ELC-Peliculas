"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("../../rutas_y_controladores/1-Usuarios/US-FN-Procesos");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = async (req, res, next) => {
	// Variables
	req.session.usuario = await BD_especificas.obtieneUsuarioPorMail(req.session.usuario.email);
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinLogin);
	let informacion;
	let usuario = req.session.usuario;
	const usuarioSinRolDeInput = {
		mensajes: [
			"Por alguna razón no tenés este permiso a pesar de que tenés validada tu identidad.",
			"Seguramente se te explicó el motivo vía mail.",
		],
		iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
		titulo: "Aviso",
	};

	// VERIFICACIÓN 1: Revisa si tiene validada su identidad
	informacion = procesos.feedbackSobreIdentidadValidada(req);

	// VERIFICACIÓN 2: Revisa si tiene el rol "Permiso input"
	if (!informacion && !usuario.rol_usuario.perm_inputs) informacion = usuarioSinRolDeInput;

	// VERIFICACIÓN 3: Revisa si está dentro de su Nivel de Confianza
	if (!informacion) {
		// Variables
		let cuentaRegistros, nivelDeConfianza;
		// Obtiene la tarea
		const originalUrl = req.originalUrl;
		const edicion = originalUrl.includes("/edicion/");
		let producto = originalUrl.startsWith("/producto/agregar/");
		let rclv = originalUrl.startsWith("/rclv/agregar");
		let links = originalUrl.startsWith("/links/abm/");

		// Cuenta los registros pendientes de revisar
		await (async () => {
			// Cuenta registros de edición
			if (edicion) cuentaRegistros = await BD_especificas.usuario_regsConEdicion(usuario.id);
			// Cuenta registros originales con status 'a revisar'
			else {
				let entidades
				let FN_entidades = ({producto, rclv, links}) => {
					if (producto) entidades = variables.entidadesProd;
					else if (rclv) entidades = variables.entidadesRCLV;
					else if (links) entidades = ["links"];
				};
				FN_entidades({producto, rclv, links});
				if (!entidades) {
					let {entidad} = req.query;
					let familia = comp.obtieneFamiliaDesdeEntidad(entidad);
					let {producto, rclv, links} = {[familia]: true};
					FN_entidades({producto, rclv, links});
				}
				cuentaRegistros = await BD_especificas.usuario_regsConStatusARevisar(usuario.id, entidades);
			}
		})();

		// Obtiene el nivel de confianza
		(() => {
			// Obtiene la cantidad de aprobaciones
			const aprob = producto
				? usuario.prods_aprob
				: rclv
				? usuario.rclvs_aprob
				: links
				? usuario.links_aprob
				: edicion
				? usuario.edics_aprob
				: 0;
			// Obtiene la cantidad de rechazos
			const rech = producto
				? usuario.prods_rech
				: rclv
				? usuario.rclvs_rech
				: links
				? usuario.links_rech
				: edicion
				? usuario.edics_rech
				: 0;
			// Prepara los parámetros
			const cantMinima = parseInt(process.env.cantMinima);
			const acelerador = parseInt(process.env.acelerador);
			const cantDesempeno = aprob - rech + acelerador;
			// Obtiene el nivel de confianza
			nivelDeConfianza = Math.max(cantMinima, cantDesempeno);
		})();

		// Si la cantidad de registros es mayor o igual que el nivel de confianza --> Error
		let mensajes = edicion
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
		if (cuentaRegistros >= nivelDeConfianza)
			informacion = {
				mensajes,
				iconos: [vistaAnterior],
			};
	}

	// VERIFICACION 4: Revisa si requiere el cartel de "responsabilidad"
	if (!informacion) {
		// Variables
		let baseUrl = req.baseUrl.slice(1);
		let familia = baseUrl.startsWith("producto")
			? {campo: "prods", vista: "PA"}
			: // : baseUrl.startsWith("rclv")
			  // ? {campo: "rclvs", vista: "RCLV"}
			  // : baseUrl.startsWith("links")
			  // ? {campo: "links", vista: "LK"}
			  "";
		let cartel = "cartel_resp_" + familia.campo;
		// Revisa si requiere el cartel de "responsabilidad" de la familia
		if (familia && usuario[cartel]) {
			// Variable
			let objeto = {
				titulo: "Responsabilidad",
				tema: "responsabilidad",
				vista: familia.vista + "9-Responsab",
				urlActual: req.session.urlActual,
			};
			// Quita la necesidad del cartel
			BD_genericas.actualizaPorId("usuarios", usuario.id, {[cartel]: false});
			// Vista
			return res.render("CMP-0Estructura", objeto);
		}
	}

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
