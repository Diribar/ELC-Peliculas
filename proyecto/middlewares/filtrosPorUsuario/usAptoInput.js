"use strict";
// Requires
const procesos = require("../../rutas_y_controladores/1.1.1-Usuarios/US-FN-Procesos");

module.exports = async (req, res, next) => {
	// Variables
	const usuario = await BD_especificas.obtieneUsuarioPorMail(req.session.usuario.email);
	req.session.usuario = usuario;
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinPermInput);
	let informacion;

	// VERIFICACIÓN 1: Revisa si el usuario tiene el status perenne
	if (usuario.statusRegistro_id != perennes_id) informacion = procesos.infoNoPerenne(req);

	// VERIFICACIÓN 2: Revisa si tiene el rol "Permiso input"
	if (!informacion && !usuario.rolUsuario.permInputs)
		informacion = {
			mensajes: [
				"Se te quitó el permiso para ingresar información pública.",
				"Se te debe hacer comunicado el motivo vía mail.",
			],
			iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
			titulo: "Aviso",
		};

	// VERIFICACIÓN 3: Revisa si está dentro de su Nivel de Confianza
	if (!informacion && !usuario.rolUsuario.autTablEnts) {
		// Funciones
		const FN = {
			entidades: () => {
				// Variables
				const {entidad} = req.query;
				const familia = comp.obtieneDesdeEntidad.familia(entidad);

				// Resultados
				const producto = originalUrl.startsWith("/producto/agregar/") || familia == "producto";
				const rclv = originalUrl.startsWith("/rclv/agregar") || familia == "rclv";
				const links = originalUrl.startsWith("/links/abm/") || familia == "links";
				const entidades = producto
					? variables.entidades.prods
					: rclv
					? variables.entidades.rclvs
					: links
					? ["links"]
					: "";

				// Fin
				return {entidades, producto, rclv, links};
			},
			// Cuenta los registros pendientes de revisar
			registrosPends: async function () {
				// Variables
				const {entidades} = this.entidades();

				// Fin
				return edicion
					? // Cuenta registros de edición
					  await BD_especificas.usuario_regsConEdicion(usuario.id)
					: // Cuenta registros originales con status 'a revisar'
					  await BD_especificas.usuario_regsConStatusARevisar(usuario.id, entidades);
			},
			// Obtiene el nivel de confianza
			nivelDeConfianza: function () {
				// Variables
				const {producto, rclv, links} = this.entidades();

				// Obtiene la cantidad de aprobaciones
				const aprob = producto
					? usuario.prodsAprob
					: rclv
					? usuario.rclvsAprob
					: links
					? usuario.linksAprob
					: edicion
					? usuario.edicsAprob
					: 0;

				// Obtiene la cantidad de rechazos
				const rech = producto
					? usuario.prodsRech
					: rclv
					? usuario.rclvsRech
					: links
					? usuario.linksRech
					: edicion
					? usuario.edicsRech
					: 0;

				// Prepara los parámetros
				const cantMinima = parseInt(process.env.cantMinima);
				const acelerador = parseInt(process.env.acelerador);
				const cantDesempeno = aprob - rech + acelerador;

				// Fin
				return Math.max(cantMinima, cantDesempeno);
			},
		};

		// Variables
		const originalUrl = req.originalUrl;
		const edicion = originalUrl.includes("/edicion/");
		const registrosPends = await FN.registrosPends();
		const nivelDeConfianza = FN.nivelDeConfianza();

		// Si la cantidad de registros es mayor o igual que el nivel de confianza --> Error
		if (registrosPends >= nivelDeConfianza)
			informacion = {
				mensajes: edicion
					? [
							"Gracias por los ediciones sugeridas anteriormente.",
							"Queremos analizarlas, antes de que sigas editando otros registros.",
							"En cuanto las hayamos analizado, te habilitaremos para que edites más.",
							"La cantidad autorizada irá aumentando a medida que tus propuestas sean aprobadas.",
					  ]
					: [
							"Gracias por los registros agregados anteriormente.",
							"Queremos analizarlos, antes de que sigas agregando otros.",
							"Cuando los hayamos analizado, te habilitaremos para que ingreses más.",
							"La cantidad autorizada irá aumentando a medida que tus propuestas sean aprobadas.",
					  ],
				iconos: [vistaAnterior],
				trabajando: true,
			};
	}

	// VERIFICACION 4: Revisa si requiere el cartel de "responsabilidad"
	if (!informacion) {
		// Variables
		const {baseUrl} = comp.reqBasePathUrl(req);
		const familia = baseUrl.startsWith("/producto")
			? {campo: "prods", vista: "PA"}
			: // : baseUrl.startsWith("/rclv")
			  // ? {campo: "rclvs", vista: "RCLV"}
			  // : baseUrl.startsWith("/links")
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
	if (informacion) res.render("CMP-0Estructura", {informacion});
	else next();
};
