"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/1-Procesos/Variables");
const comp = require("../../funciones/1-Procesos/Compartidas");

module.exports = {
	// Tablero
	TC: {
		validaIdentidades: async (userID) => {
			// Variables
			const condicion = {rolUsuario_id: rol_consultas_id, statusRegistro_id: st_ident_a_validar_id, id: {[Op.ne]: userID}};

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
		validaUsuario: (usuario, campos) => {
			// Variables
			const link = "/inactivar-captura/?entidad=usuarios&id=" + usuario.id + "&origen=TU";
			const vistaEntendido = variables.vistaEntendido(link);
			campos.push({titulo: "Nombre del archivo de imagen del documento", nombre: "documAvatar"});
			let informacion, documAvatar;

			// Valida que todos los campos necesarios tengan valor
			for (let campo of campos)
				if (!usuario[campo.nombre]) {
					informacion = {
						mensajes: ["Al registro le falta el valor en el campo '" + campo.titulo + "'."],
						iconos: [vistaEntendido],
					};
					break;
				}

			// Valida que exista el archivo del documAvatar
			if (!informacion) {
				documAvatar = "/imagenes/1-Usuarios/DNI-Revisar/" + usuario.documAvatar;
				if (!comp.gestionArchivos.existe("./publico" + documAvatar))
					informacion = {
						mensajes: ["No existe el archivo de imagen del documento."],
						iconos: [vistaEntendido],
					};
			}

			// Valida que el archivo esté en el status correcto
			if (!informacion && !usuario.statusRegistro.ident_a_validar) {
				const statusActualNombre = status_registro_us.find((n) => n.id == usuario.statusRegistro_id).nombre;

				informacion = {
					mensajes: [
						"El registro no está en el status esperado.",
						"Se esperaba que estuviera en el status 'Identidad a validar'.",
						"Está en el status '" + statusActualNombre + "'.",
					],
					iconos: [vistaEntendido],
				};
			}

			// Fin
			return {informacion, documAvatar};
		},
		hist_edics: (campo, usuario, revID, motivo) => {
			// Alimenta la tabla 'hist_edics'
			let datos = {
				entidad: "usuarios",
				entidad_id: usuario.id,
				campo,
				titulo: campo,
				valor_rech: usuario[campo],
				valor_aprob: "(vacío)",
	
				motivo_id: motivo.id,
				duracion: motivo.duracion,
	
				editadoPor_id: usuario.id,
				editadoEn: usuario.fechaRevisores,
				edicRevisadaPor_id: revID,
				edicRevisadaEn: comp.fechaHora.ahora(),
			};
			BD_genericas.agregaRegistro("hist_edics", datos);
	
			// Fin
			return;
		},
	},
};
