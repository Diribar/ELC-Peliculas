"use strict";
// Definir variables
const BD_genericas = require("../../funciones/1-BD/Genericas");
const comp = require("../../funciones/2-Procesos/Compartidas");

module.exports = {
	// Tablero
	TC: {
		validaIdentidades: async (userID) => {
			// Variables
			const condicion = {rolUsuario_id: rolConsultas_id, statusRegistro_id: stIdentPendValidar_id, id: {[Op.ne]: userID}};

			// Obtiene los usuarios
			let usuarios = await BD_genericas.obtieneTodosPorCondicion("usuarios", condicion);

			// Procesa la información
			usuarios = usuarios.map((n) => {
				let fecha = comp.fechaHora.fechaHorario(n.fechaRevisores).replace("a las", "-");
				return {id: n.id, apodo: n.apodo, fecha};
			});

			// Fin
			return usuarios;
		},
	},
	VI: {
		histEdics: ({campo, usuario, revID, motivo}) => {
			// Alimenta la tabla 'histEdics'
			let datos = {
				// Datos generales
				entidad: "usuarios",
				entidad_id: usuario.id,
				campo: campo.nombre,
				titulo: campo.titulo,
				valorDesc: usuario[campo],

				// Motivo
				penalizac: motivo.penalizac,
				motivo_id: motivo.id,

				// Fechas y Usuarios
				sugeridoPor_id: usuario.id,
				sugeridoEn: usuario.fechaRevisores,
				revisadoPor_id: revID,
				revisadoEn: comp.fechaHora.ahora(),
			};
			BD_genericas.agregaRegistro("histEdics", datos);

			// Fin
			return;
		},
	},
};
