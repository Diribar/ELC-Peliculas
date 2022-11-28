"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./Procesos");
// const valida = require("./FN-Validar");

module.exports = {
	// Revisión
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionUs";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;
		let usuarios = {};
		// Obtiene las solicitudes de Permiso de Input
		usuarios.validaIdentidades = await procesos.TC_validaIdentidades(userID);
		// Va a la vista
		// return res.send(autInputs);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Usuarios",
			usuarios,
		});
	},
	// Revisar Permiso Data-Entry
	validaIdentidadForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionUs";
		const codigo = "validaIdentidad";
		// Temas del usuario
		let userID = req.query.id;
		let usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, [
			"sexo",
			"rol_usuario",
			"status_registro",
		]);
		// Redireccionar si no existe el usuario o el avatar
		let docum_avatar = usuario ? "./publico/imagenes/5-DocsRevisar/" + usuario.docum_avatar : false;
		if (procesos.validaContenidoIF(usuario, docum_avatar))
			return res.redirect("/revision/usuarios/tablero-de-control");
		// 3. Otras variables
		let pais = await BD_genericas.obtienePorId("paises", usuario.docum_pais_id).then((n) => n.nombre);
		let fecha_nacimiento = comp.fechaTexto(usuario.fecha_nacimiento);
		let campos = [
			{titulo: "País de Expedición", nombre: "docum_pais_id", valor: pais},
			{titulo: "Apellido", nombre: "apellido", valor: usuario.apellido},
			{titulo: "Nombre", nombre: "nombre", valor: usuario.nombre},
			{titulo: "Sexo", nombre: "sexo_id", valor: usuario.sexo.nombre},
			{titulo: "Fecha de Nacim.", nombre: "fecha_nacimiento", valor: fecha_nacimiento},
			{titulo: "N° de Documento", nombre: "docum_numero", valor: usuario.docum_numero},
		];
		let motivos_rech = await BD_genericas.obtieneTodos("us_motivos_rech", "orden");
		let motivos_docum = motivos_rech.filter((n) => n.mostrar_para_docum);
		// 4. Va a la vista
		// return res.send(motivos_docum)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Validación de Identidad",
			usuario,
			avatar: "/imagenes/0-Base/ImagenDerecha.jpg",
			docum_avatar: "/imagenes/5-DocsRevisar/" + usuario.docum_avatar,
			title: usuario.apodo,
			campos,
			userID,
			motivos_docum,
			mostrarCartel: true,
		});
	},
	validaIdentidadGuardar: async (req, res) => {
		// return res.send(req.body)
		// Toma los datos del formulario
		let datos = {...req.query, ...req.body};
		// Si no se respondió algún campo necesario, reenvía al formulario
		let redireccionar;
		if (datos.motivo_docum_id == "0") {
			let campos = [
				"docum_pais_id",
				"apellido",
				"nombre",
				"sexo_id",
				"fecha_nacimiento",
				"docum_numero",
			];
			for (let campo of campos) if (!Object.keys(req.body).includes(campo)) redireccionar = true;
		} else if (!datos.motivo_docum_id) redireccionar = true;
		if (redireccionar) return res.redirect(req.originalUrl);

		// Variables de usuarios
		let usuario = await BD_genericas.obtienePorId("usuarios", datos.id);
		let revID = req.session.usuario.id;
		// Variables de motivos
		let motivos = await BD_genericas.obtieneTodos("us_motivos_rech", "orden");
		let durac_penalidad = 0;
		// Variables de 'status de registro'
		let st_editables_ID = status_registro_us.find((n) => n.editables).id;
		let st_ident_validada_ID = status_registro_us.find((n) => n.ident_validada).id;
		let status_registro_id = st_ident_validada_ID;
		// Informacion a agregarle al usuario
		let objeto = {fecha_revisores: comp.ahora()};

		// Acciones en función de lo que haya respondido sobre la imagen del documento
		if (datos.motivo_docum_id == "0") {
			// Motivo genérico
			let motivo = motivos.find((n) => !n.mostrar_para_docum);
			// Rutinas para los demás campos --> lleva al status 'editables'
			let campos;
			campos = ["docum_pais_id", "docum_numero"];
			for (let campo of campos)
				if (datos[campo] == "NO") {
					procesos.usuarioEdicRech(campo, usuario, revID, motivo);
					status_registro_id = st_editables_ID;
					durac_penalidad += motivo.duracion;
				}
			campos = ["nombre", "apellido", "sexo_id", "fecha_nacimiento"];
			for (let campo of campos)
				if (datos[campo] == "NO") {
					procesos.usuarioEdicRech(campo, usuario, revID, motivo);
					status_registro_id = st_editables_ID;
					durac_penalidad += motivo.duracion;
				}
		} else {
			// Rutinas para el campo
			let motivo = motivos.find((n) => n.id == datos.motivo_docum_id);
			procesos.usuarioEdicRech("docum_avatar", usuario, revID, motivo);
			status_registro_id = st_editables_ID;
			durac_penalidad += motivo.duracion;
		}
		// Acciones si se aprueba la validación
		if (status_registro_id == st_ident_validada_ID) {
			// Asigna el rol 'permInputs'
			let rolPermInputs = roles_us.find((n) => n.perm_inputs && !n.revisor_ents && !n.revisor_us).id;
			objeto.rol_usuario_id = rolPermInputs;
			// Mueve la imagen del documento a su carpeta definitiva
			comp.mueveUnArchivoImagen(usuario.docum_avatar, "5-DocsRevisar", "2-DocsUsuarios");
		}
		// Actualiza el usuario
		objeto = {...objeto, status_registro_id};
		await BD_genericas.actualizaPorId("usuarios", datos.id, objeto);
		// Aplica la durac_penalidad
		if (durac_penalidad)
			BD_genericas.aumentaElValorDeUnCampo("usuarios", datos.id, "penalizac_acum", durac_penalidad);

		// Libera y vuelve al tablero
		return res.redirect("/inactivar-captura/?entidad=usuarios&id=" + usuario.id + "&origen=tableroUs");
	},
};
