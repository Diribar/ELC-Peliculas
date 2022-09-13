"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = async (req, res, next) => {
	// Variables
	const usuario = req.session.usuario;
	const vistaAnterior = variables.vistaAnterior(req.session.urlSinLogin);
	let informacion;

	// Fórmulas
	let detectarUsuarioPenalizado = () => {
		// Variables
		let informacion;
		// Proceso
		if (usuario.penalizado_hasta && usuario.penalizado_hasta > compartidas.ahora()) {
			let fecha = compartidas.fechaTexto(usuario.penalizado_hasta);
			informacion = {
				mensajes: [
					"Necesitamos que la información que nos brindes esté más alineada con nuestro perfil y sea precisa.",
					"Podrás volver a ingresar información el día " + fecha + ".",
				],
				iconos: [vistaAnterior],
			};
		}
		return informacion;
	};
	let permisoInputs = () => {
		let informacion;
		if (!usuario.rol_usuario.perm_inputs) {
			if (!usuario.status_registro.docum_revisar)
				informacion = {
					mensajes: [
						"El ingreso de información para otras personas, requiere responsabilidad.",
						"Para asegurarnos eso, cada persona debe tener un sólo usuario cuya reputación debe cuidar.",
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
							// link: "/usuarios/responsabilidad",
							link:"/usuarios/documento",
							titulo: "Validar identidad",
						},
					],
					titulo: "Aviso",
					colorFondo: "verde",
				};
			else
				informacion = {
					mensajes: [
						"Para ingresar información, se requiere un permiso que ya nos solicitaste.",
						"Nos lo pediste el " + compartidas.fechaHorarioTexto(usuario.fecha_revisores) + ".",
						"Tenés que esperar a que el equipo de Revisores valide tus datos personales con tu documento.",
						"Luego de la validación, recibirás un mail de feedback.",
						"En caso de estar aprobado, podrás ingresarnos información.",
					],
					iconos: [variables.vistaEntendido(req.session.urlSinPermInput)],
					titulo: "Aviso",
					colorFondo: "gris",
				};
		}
		// Fin
		return informacion;
	};
	let compararRegistrosConNivelDeConfianza = async () => {
		// Variables
		let informacion;
		// Obtener datos del url
		const originalUrl = req.originalUrl;
		// Obtener la tarea
		const producto = originalUrl.startsWith("/producto/agregar/");
		const edicion = originalUrl.startsWith("/producto/edicion/");
		const rclv = originalUrl.startsWith("/rclv/");
		const links = originalUrl.startsWith("/links/abm/");
		// Obtener su nivel de confianza
		const nivelDeConfianza = nivel_de_confianza(usuario, producto, rclv, links, edicion);
		// Contar registros
		const contarRegistros = contar_registros(usuario, producto, rclv, links, edicion);

		// Si la cantidad de registros es mayor o igual que el nivel de confianza --> Error
		if (contarRegistros >= nivelDeConfianza)
			informacion = {
				mensajes: mensajes(edicion),
				iconos: [vistaAnterior],
				colorFondo: "gris",
			};
		// Fin
		return informacion;
	};

	// VERIFICACIÓN: Redirecciona si el usuario no está logueado
	if (!usuario) return res.redirect("/usuarios/login");
	// VERIFICACIÓN: Redirecciona si el usuario no completó el alta de usuario
	if (!usuario.status_registro.editables_ok) return res.redirect("/usuarios/redireccionar");
	// VERIFICACIÓN: Usuario penalizado
	if (!informacion) informacion = detectarUsuarioPenalizado();
	// VERIFICACIÓN: Permiso input
	if (!informacion) informacion = permisoInputs();
	// VERIFICACIÓN: Registros a revisar >= Nivel de Confianza
	if (!informacion) informacion = await compararRegistrosConNivelDeConfianza();

	// Fin
	if (informacion) return res.render("MI-Cartel", {informacion});
	else next();
};

let nivel_de_confianza = (usuario, producto, rclv, links, edicion) => {
	// Obtener la cantidad de aprobaciones
	const aprob = producto
		? usuario.prods_aprob
		: rclv
		? usuario.rclvs_aprob
		: links
		? usuario.links_aprob
		: edicion
		? usuario.edics_aprob
		: 0;
	// Obtener la cantidad de rechazos
	const rech = producto
		? usuario.prods_rech
		: rclv
		? usuario.rclvs_rech
		: links
		? usuario.links_rech
		: edicion
		? usuario.edics_rech
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
let contar_registros = async (usuario, producto, rclv, links, edicion) => {
	// Contar registros
	let contarRegistros = 0;
	// Contar registros con status 'a revisar'
	let entidades;
	if (producto) entidades = ["peliculas", "colecciones", "capitulos"];
	else if (rclv) entidades = ["personajes", "hechos", "valores"];
	else if (links) entidades = ["links"];
	if (entidades) contarRegistros = await BD_especificas.registrosConStatusARevisar(usuario.id, entidades);
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
