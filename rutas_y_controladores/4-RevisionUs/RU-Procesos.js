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
			const condicion = {rol_usuario_id: rol_consultas_id, status_registro_id: st_ident_a_validar_id, id: {[Op.ne]: userID}};

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
			campos.push({titulo: "Nombre del archivo de imagen del documento", nombre: "docum_avatar"});
			let informacion, docum_avatar;

			// Valida que todos los campos necesarios tengan valor
			for (let campo of campos)
				if (!usuario[campo.nombre]) {
					informacion = {
						mensajes: ["Al registro le falta el valor en el campo '" + campo.titulo + "'."],
						iconos: [vistaEntendido],
					};
					break;
				}

			// Valida que exista el archivo del docum_avatar
			if (!informacion) {
				docum_avatar = "/imagenes/1-Usuarios/DNI-Revisar/" + usuario.docum_avatar;
				if (!comp.gestionArchivos.existe("./publico" + docum_avatar))
					informacion = {
						mensajes: ["No existe el archivo de imagen del documento."],
						iconos: [vistaEntendido],
					};
			}

			// Valida que el archivo esté en el status correcto
			if (!informacion && !usuario.status_registro.ident_a_validar) {
				const statusActualNombre = status_registro_us.find((n) => n.id == usuario.status_registro_id).nombre;

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
			return {informacion, docum_avatar};
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
	
				editado_por_id: usuario.id,
				editado_en: usuario.fechaRevisores,
				edic_revisada_por_id: revID,
				edic_revisada_en: comp.fechaHora.ahora(),
			};
			BD_genericas.agregaRegistro("hist_edics", datos);
	
			// Fin
			return;
		},
	},
};
