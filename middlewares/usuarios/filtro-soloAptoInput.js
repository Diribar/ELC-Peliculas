"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	req.session.usuario = await BD_especificas.obtieneUsuarioPorMail(req.session.usuario.email);
	let usuario = req.session.usuario;
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinLogin);
	let informacion;

	// VERIFICACIÓN 2: Tiene identidad validada
	if (!informacion) {
		// Verifica si la identidad está validada
		if (!usuario.status_registro.ident_validada) {
			// Status: identidad a validar
			if (usuario.status_registro.ident_a_validar)
				informacion = {
					mensajes: [
						"Para ingresar información, se requiere tener tus datos validados.",
						"Nos informaste tu documento el " +
							comp.fechaHorarioTexto(usuario.fecha_revisores) +
							".",
						"Tenés que esperar a que el equipo de Revisores haga la validación.",
						"Luego de la validación, recibirás un mail de feedback.",
						"En caso de estar aprobado, podrás ingresarnos información.",
					],
					iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
					titulo: "Aviso",
					trabajando: true,
				};
			// Status: editables
			if (usuario.status_registro.editables)
				informacion = {
					mensajes: [
						"El ingreso de información para otras personas, requiere responsabilidad.",
						"Para asegurarnos eso, cada persona debe tener un único usuario de por vida, cuya reputación debe cuidar.",
						"Por eso, necesitamos validar tu identidad con tu documento.",
						"Podés iniciar el trámite haciendo click en la flecha hacia la derecha.",
					],
					iconos: [
						{
							nombre: "fa-circle-left",
							link: req.session.urlSinPermInput,
							titulo: "Ir a la vista anterior",
						},
						{
							nombre: "fa-circle-right",
							link: "/usuarios/valida-identidad",
							titulo: "Ir a 'Documento'",
							autofocus: true,
						},
					],
					titulo: "Aviso",
					trabajando: true,
				};
		}
	}
	// VERIFICACIÓN 3: Permiso input
	if (!informacion) {
		if (!usuario.rol_usuario.perm_inputs) {
			informacion = {
				mensajes: [
					"Por alguna razón no tenés este permiso a pesar de que tenés validada tu identidad.",
					"Seguramente se te explicó el motivo vía mail.",
				],
				iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
				titulo: "Aviso",
			};
		}
	}
	// VERIFICACIÓN 4: Nivel de Confianza
	if (!informacion) {
		// Variables
		let cuentaRegistros, nivelDeConfianza;
		// Obtiene la tarea
		const originalUrl = req.originalUrl;
		const edicion = originalUrl.includes("/edicion/");
		const producto = originalUrl.startsWith("/producto/agregar/");
		const rclv = originalUrl.startsWith("/rclv/agregar");
		const links = originalUrl.startsWith("/links/abm/");

		// Cuenta los registros pendientes de revisar
		await (async () => {
			// Cuenta registros de edición
			if (edicion) cuentaRegistros = await BD_especificas.usuario_regsConEdicion(usuario.id);
			// Cuenta registros originales con status 'a revisar'
			else {
				let entidades;
				if (producto) entidades = variables.entidadesProd;
				else if (rclv) entidades = variables.entidadesRCLV;
				else if (links) entidades = ["links"];
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

	// Fin
	if (informacion) return res.render("CMP-0Estructura", {informacion});
	else next();
};
