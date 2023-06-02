"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");

module.exports = {
	// Tablero
	TC: {
		validaIdentidades: async (userID) => {
			// Variables
			const condicion = {rol_usuario_id: rol_consultas_id, status_registro_id: st_ident_a_validar, id: {[Op.ne]: userID}};

			// Obtiene los usuarios
			let usuarios = await db.usuarios.findAll({where: condicion}).then((n) => n.map((m) => m.toJSON()));

			// Procesa la información
			usuarios = usuarios.map((n) => {
				let fecha = comp.fechaHora.fechaHorario(n.fecha_revisores).replace("a las", "-");
				return {id: n.id, apodo: n.apodo, fecha};
			});

			// Fin
			return usuarios;
		},
	},
	validaContenidoIF: (usuario, avatar) => {
		// Variables
		let redireccionar;
		let campos = ["apellido", "nombre", "sexo_id", "fecha_nacim", "docum_numero", "docum_avatar"];
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
			!comp.gestionArchivos.existe(avatar)
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

			editado_por_id: usuario.id,
			editado_en: usuario.fecha_revisores,
			edic_revisada_por_id: revID,
			edic_revisada_en: comp.fechaHora.ahora(),
		};
		BD_genericas.agregaRegistro("edics_rech", datos);

		// Fin
		return;
	},
};
