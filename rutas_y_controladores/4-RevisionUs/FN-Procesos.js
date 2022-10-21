"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../2.1-Prod-RUD/FN-Validar");

module.exports = {
	// Tablero
	TC_validarIdentidades: async function (userID) {
		// Rol no permInputs
		let rol_consultas_id = roles_us.find((n) => !n.perm_inputs).id;
		// Status Documento
		let status_docum_revisar_id = status_registro_us.find((n) => n.ident_a_validar && !n.ident_validada).id;
		// Campos para filtrar
		let campos = {
			rol_usuario_id: rol_consultas_id,
			status_registro_id: status_docum_revisar_id,
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
			let fecha = comp.fechaHorarioTexto(n[campoFecha]).replace("a las", "-");
			return {id: n.id, apodo: n.apodo, fecha};
		});
	},
};

// Funciones ----------------------------
