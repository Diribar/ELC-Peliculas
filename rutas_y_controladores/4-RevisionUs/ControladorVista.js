"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
// const validar = require("./FN-Validar");

module.exports = {
	// Revisión
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionUs";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;
		let usuarios = {};
		// Obtiene las solicitudes de Permiso de Input
		usuarios.autInputs = await procesos.tablero_obtenerPermInput(userID);
		// Va a la vista
		// return res.send(autInputs);
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Usuarios",
			usuarios,
		});
	},
	// Revisar Permiso Data-Entry
	permisoInputs: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionUs";
		const codigo = "permInputs";
		// 2. Obtener el ID del usuario
		let id = req.query.id;
		// 3. Obtener el usuario
		let user = await BD_especificas.obtenerUsuarioPorID(id);
		let avatar = "/imagenes/1-Usuarios/" + user.avatar;
		// 4. Va a la vista
		return res.render("CMP-RV-Estructura", {
			tema,
			codigo,
			titulo: "Permiso Inputs",
			user,
			avatar,
			title: "",
		});
	},
};
