"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const valida = require("../2.1-Prod-RUD/FN-Validar");

module.exports = {
	// Tablero
	TC_validaIdentidades: async (userID) => {
		// Variables
		let campos;
		// Rol no permInputs
		let rol_consultas_id = roles_us.find((n) => !n.perm_inputs).id;
		// Status 'Documento'
		let st_ident_a_validar = status_registro_us.find((n) => n.ident_a_validar && !n.ident_validada).id;
		// Campos para filtrar
		campos = {
			rol_usuario_id: rol_consultas_id,
			status_registro_id: st_ident_a_validar,
		};
		// Obtiene el usuario
		// let includes = [];
		let usuarios = await BD_especificas.obtieneUsuarioDistintoIdMasFiltros(userID, campos);
		// Quita los usuarios incompletos
		campos = ["apellido", "nombre", "sexo_id", "fecha_nacimiento", "docum_numero", "docum_avatar"];
		// Valida que todos los campos necesarios de 'usuario' tengan valor
		for (let i = usuarios.length - 1; i >= 0; i--) {
			for (let campo of campos) {
				if (!usuarios[i][campo]) {
					usuarios.splice(i, 1);
					break;
				}
			}
		}

		// Le corrije el formato
		let TC_formatoUsuarios = (campoFecha) => {
			return usuarios.map((n) => {
				let fecha = comp.fechaHorarioTexto(n[campoFecha]).replace("a las", "-");
				return {id: n.id, apodo: n.apodo, fecha};
			});
		};
		usuarios = TC_formatoUsuarios("fecha_revisores");
		// Fin
		return usuarios;
	},
	validaContenidoIF: (usuario, avatar) => {
		// Variables
		let redireccionar;
		let campos = ["apellido", "nombre", "sexo_id", "fecha_nacimiento", "docum_numero", "docum_avatar"];
		// Valida que todos los campos necesarios de 'usuario' tengan valor
		for (let campo of campos) if (!usuario[campo]) redireccionar = true;
		// Hace otras validaciones
		// 1. Que el usuario esté en status 'identidad a validar'
		// 2. Que exista el archivo 'avatar'
		if (
			redireccionar ||
			!usuario.status_registro.ident_a_validar ||
			usuario.status_registro.ident_validada ||
			!avatar ||
			!comp.averiguaSiExisteUnArchivo(avatar)
		)
			redireccionar = true;
		// Fin
		return redireccionar;
	},
	usuarioEdicRech: (campo, usuario, revID, motivo) => {
		// Alimenta la tabla 'edics_rech'
		let datos = {
			entidad: "usuarios",
			entidad_id: usuario.id,
			campo,
			titulo: campo,
			valor_rech: usuario[campo],
			valor_aprob: null,

			motivo_id: motivo.id,
			duracion: motivo.duracion,

			input_por_id: usuario.id,
			input_en: usuario.fecha_revisores,
			evaluado_por_id: revID,
			evaluado_en: comp.ahora(),
		};
		BD_genericas.agregaRegistro("edics_rech", datos);

		// Fin
		return;
	},
};
