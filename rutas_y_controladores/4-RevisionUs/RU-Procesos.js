"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");

module.exports = {
	// Tablero
	TC: {
		validaIdentidades: async (userID) => {
			// Variables
			const condicion = {rolUsuario_id: rol_consultas_id, statusRegistro_id: identPendValidar_id, id: {[Op.ne]: userID}};

			// Obtiene los usuarios
			let usuarios = await db.usuarios.findAll({where: condicion}).then((n) => n.map((m) => m.toJSON()));

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
		histEdics: (campo, usuario, revID, motivo) => {
			// Alimenta la tabla 'histEdics'
			let datos = {
				entidad: "usuarios",
				entidad_id: usuario.id,
				campo,
				titulo: campo,
				valor_rech: usuario[campo],
	
				motivo_id: motivo.id,
				penalizac: motivo.penalizac,
	
				editadoPor_id: usuario.id,
				editadoEn: usuario.fechaRevisores,
				edicRevisadaPor_id: revID,
				edicRevisadaEn: comp.fechaHora.ahora(),
			};
			BD_genericas.agregaRegistro("histEdics", datos);
	
			// Fin
			return;
		},
	},
};
