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
		let motivos_rech = await BD_genericas.obtenerTodos("us_motivos_rech", "orden");
		let motivos_docum = motivos_rech.filter((n) => n.mostrar_para_docum);
		// 4. Va a la vista
		// return res.send(motivos_docum)
		return res.render("CMP-RV-Estructura", {
			tema,
			codigo,
			titulo: "Validación de Identidad",
			user,
			avatar,
			title: user.apodo,
			campos,
			userID,
			motivos_docum,
		});
	},
	validarIdentidadGuardar: async (req, res) => {
		// return res.send({...req.query,...req.body})
		// Variables
		let datos = {...req.query, ...req.body};
		let revID = req.session.usuario.id;
		let usuario = await BD_genericas.obtenerPorId("usuarios", datos.id);
		let status_registro_id;
		let st_mail_validado_id = status_registro_us.find((n) => n.mail_validado && !n.perennes_ok).id;
		let st_editables_ID = status_registro_us.find((n) => n.editables_ok && !n.ident_a_validar).id;
		let st_ident_validada_ID = status_registro_us.find((n) => n.ident_validada).id;
		let motivos = await BD_genericas.obtenerTodos("us_motivos_rech", "orden");
		let motivo = motivos.find((n) => !n.mostrar_para_docum);

		// Campo 'documento_avatar'
		if (datos.documento_avatar == "NO" && usuario.documento_avatar) {
			// Elimina el archivo 'avatar'
			compartidas.borrarArchivo("/imagenes/2-DocsUsuarios", usuario.documento_avatar);
			// Rutinas para el campo
			let motivo = motivos.find((n) => n.id == datos.motivo_docum_id);
			status_registro_id = valIdentidad("documento_avatar", st_editables_ID, usuario, revID, motivo);
		}
		// Rutinas para el n° de documento
		if ((datos.pais_id == "NO" || datos.documento_numero == "NO") && usuario.documento_numero)
			status_registro_id = valIdentidad("documento_numero", st_editables_ID, usuario, revID, motivo);
		// Rutinas para los demás campos
		let campos = ["nombre", "apellido", "sexo_id", "fecha_nacimiento"];
		for (let campo of campos)
			if (datos[campo] == "NO" && usuario[campo])
				status_registro_id = valIdentidad(campo, st_mail_validado_id, usuario, revID, motivo);

		// Actualizar el status del usuario
		if (!status_registro_id) status_registro_id = st_ident_validada_ID;
		// Si el usuario validó sus datos y tiene rol de 'Consultas', actualizarlo a 'permInput'
		let rol_usuario_id = roles_us.find((n) => !n.perm_inputs).id;
		if (status_registro_id == st_ident_validada_ID && !usuario.rol_usuario.perm_inputs) {
			rol_usuario_id = roles_us.find((n) => n.perm_inputs && !n.revisor_ents).id;
		}
		// Actualizar el usuario
		let objeto = {status_registro_id, rol_usuario_id, fecha_revisores: compartidas.ahora()};
		await BD_genericas.actualizarPorId("usuarios", datos.id, objeto);

		// Liberar y volver al tablero
		return res.redirect("/inactivar-captura/?entidad=usuarios&id=" + usuario.id + "&origen=tableroUs");
	},
};

let valIdentidad = (campo, status_registro_id, usuario, revID, motivo) => {
	// Limpia en 'usuarios' el campo que corresponda
	BD_genericas.actualizarPorId("usuarios", usuario.id, {[campo]: null});
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
		evaluado_en: compartidas.ahora(),
	};
	BD_genericas.agregarRegistro("edics_rech", datos);

	// Fin
	return status_registro_id;
};
