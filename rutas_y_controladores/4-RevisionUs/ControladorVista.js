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
		usuarios.validarIdentidades = await procesos.tablero_validarIdentidades(userID);
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
	validarIdentidadForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionUs";
		const codigo = "validarIdentidad";
		// 2. Variables
		let userID = req.query.id;
		let user = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, "sexo");
		let avatar = "/imagenes/1-Usuarios/" + user.avatar;
		let documento = user.documento_numero;
		let pais_id = documento.slice(0, 2);
		let pais = await BD_genericas.obtenerPorId("paises", pais_id).then((n) => n.nombre);
		let documento_numero = documento.slice(4);
		let fecha_nacimiento = compartidas.fechaTexto(user.fecha_nacimiento);
		let campos = [
			{titulo: "País de Expedición", nombre: "pais_id", valor: pais},
			{titulo: "Apellido", nombre: "apellido", valor: user.apellido},
			{titulo: "Nombre", nombre: "nombre", valor: user.nombre},
			{titulo: "Sexo", nombre: "sexo_id", valor: user.sexo.nombre},
			{titulo: "Fecha de Nacim.", nombre: "fecha_nacimiento", valor: fecha_nacimiento},
			{titulo: "N° de Documento", nombre: "documento_numero", valor: documento_numero},
		];
		let motivos_rech_docum=await BD_genericas.obtenerTodos("motivos_rech_docum","orden")
		// 4. Va a la vista
		return res.render("CMP-RV-Estructura", {
			tema,
			codigo,
			titulo: "Validación de Identidad",
			user,
			avatar,
			title: user.apodo,
			campos,
			userID,
			motivos_rech_docum,
		});
	},
	validarIdentidadGuardar: async (req, res) => {
		return res.send(req.query)
	},
};
