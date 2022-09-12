"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
// const procesos = require("./FN-Procesos");
// const validar = require("./FN-Validar");

module.exports = {
	// Revisión
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionUs";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;
		// Obtiene las solicitudes de Permiso de Input
		let usuarios = await tablero_obtenerPermInput(userID);
		// Va a la vista
		return res.send(usuarios);
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Usuarios",
		});
	},
};

let tablero_obtenerPermInput = async (userID) => {
	// Rol no Revisor
	let roles_no_aut_input = await BD_genericas.obtenerTodosPorCampos("roles_usuarios", {
		aut_input: false,
	}).then((n) => n.map((m) => m.id));
	// Status Documento
	let status_documento = status_registro_us.find((n) => n.documento).id;
	// Campos para filtrar
	let campos = {
		status_registro_id: status_documento,
		rol_usuario_id: roles_no_aut_input,
	};
	// let includes = [];
	let usuarios = await BD_especificas.obtenerUsuarioDistintoIdMasFiltros(userID, campos);
	// Fin
	return usuarios;
};
