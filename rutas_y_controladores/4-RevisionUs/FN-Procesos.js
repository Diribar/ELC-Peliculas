"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../2.1-Prod-RUD/FN-Validar");

module.exports = {
	// Tablero
	tablero_obtenerPermInput: async function (userID) {
		// Rol no Revisor
		let roles_no_perm_inputs = await BD_genericas.obtenerTodosPorCampos("roles_usuarios", {
			perm_inputs: false,
		}).then((n) => n.map((m) => m.id));
		// Status Documento
		let status_docum_revisar = status_registro_us.find((n) => n.docum_revisar && !n.ident_validada).id;
		// Campos para filtrar
		let campos = {
			status_registro_id: status_docum_revisar,
			rol_usuario_id: roles_no_perm_inputs,
		};
		// Obtener el usuario
		// let includes = [];
		let usuarios = await BD_especificas.obtenerUsuarioDistintoIdMasFiltros(userID, campos);
		usuarios = this.formatoUsuarios(usuarios, "fecha_revisores");
		// Fin
		return usuarios;
	},
	formatoUsuarios: (usuarios, campoFecha) => {
		return usuarios.map((n) => {
			let fecha = compartidas.fechaHorarioTexto(n[campoFecha]).replace("a las", "-");
			return {id: n.id, apodo: n.apodo, fecha};
		});
	},
};

// Funciones ----------------------------
