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
		usuarios.validarIdentidades = await procesos.TC_validarIdentidades(userID);
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
	validarIdentidadForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionUs";
		const codigo = "validarIdentidad";
		// Temas del usuario
		let userID = req.query.id;
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, [
			"sexo",
			"rol_usuario",
			"status_registro",
		]);
		// Redireccionar si no existe el usuario o el avatar
		let docum_avatar = usuario ? "./publico/imagenes/5-DocsRevisar/" + usuario.docum_avatar : false;
		if (validarContenidoIF(usuario, docum_avatar))
			return res.redirect("/revision/usuarios/tablero-de-control");
		// 3. Otras variables
		let pais = await BD_genericas.obtenerPorId("paises", usuario.docum_pais_id).then((n) => n.nombre);
		let fecha_nacimiento = compartidas.fechaTexto(usuario.fecha_nacimiento);
		let campos = [
			{titulo: "País de Expedición", nombre: "docum_pais_id", valor: pais},
			{titulo: "Apellido", nombre: "apellido", valor: usuario.apellido},
			{titulo: "Nombre", nombre: "nombre", valor: usuario.nombre},
			{titulo: "Sexo", nombre: "sexo_id", valor: usuario.sexo.nombre},
			{titulo: "Fecha de Nacim.", nombre: "fecha_nacimiento", valor: fecha_nacimiento},
			{titulo: "N° de Documento", nombre: "docum_numero", valor: usuario.docum_numero},
		];
		let motivos_rech = await BD_genericas.obtenerTodos("us_motivos_rech", "orden");
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
			cartel: true,
		});
	},
	validarIdentidadGuardar: async (req, res) => {
		// return res.send(req.body)
		// Toma los datos del formulario
		let datos = {...req.query, ...req.body};

		// Si no se respondió algún campo necesario, reenvía al formulario
		let redireccionar = false;
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
		let usuario = await BD_genericas.obtenerPorId("usuarios", datos.id);
		let revID = req.session.usuario.id;
		// Variables de motivos
		let motivos = await BD_genericas.obtenerTodos("us_motivos_rech", "orden");
		let durac_penalidad = 0;
		// Variables de 'status de registro'
		let st_mail_validado_id = status_registro_us.find((n) => n.mail_validado).id;
		let st_editables_ID = status_registro_us.find((n) => n.editables).id;
		let st_ident_validada_ID = status_registro_us.find((n) => n.ident_validada).id;
		let status_registro_id;

		// Acciones en función de lo que haya respondido sobre la imagen del documento
		if (datos.motivo_docum_id == "0") {
			// Motivo genérico
			let motivo = motivos.find((n) => !n.mostrar_para_docum);
			// Rutinas para los demás campos --> lleva al status 'mail_validado'
			let campos;
			campos = ["docum_pais_id", "docum_numero"];
			for (let campo of campos)
				if (datos[campo] == "NO") {
					rutinasIdentGuardar(campo, usuario, revID, motivo);
					status_registro_id = st_editables_ID;
					durac_penalidad += motivo.duracion;
				}
			campos = ["nombre", "apellido", "sexo_id", "fecha_nacimiento"];
			for (let campo of campos)
				if (datos[campo] == "NO") {
					rutinasIdentGuardar(campo, usuario, revID, motivo);
					status_registro_id = st_mail_validado_id;
					durac_penalidad += motivo.duracion;
				}
		} else {
			// Elimina el archivo 'avatar'
			compartidas.borraUnArchivo("./publico/imagenes/5-DocsRevisar", usuario.docum_avatar);
			// Rutinas para el campo
			let motivo = motivos.find((n) => n.id == datos.motivo_docum_id);
			rutinasIdentGuardar("docum_avatar", usuario, revID, motivo);
			status_registro_id = st_editables_ID;
			durac_penalidad += motivo.duracion;
		}
		// Acciones si se aprueba la validación
		if (!status_registro_id) {
			// Actualiza el status del usuario
			status_registro_id = st_ident_validada_ID;
			// Mueve la imagen del documento a su carpeta definitiva
			compartidas.mueveUnArchivoImagen(usuario.docum_avatar, "5-DocsRevisar", "2-DocsUsuarios");
		}
		// Le asigna al usuario el rol que le corresponda ('Consultas' o 'permInput')
		let rol_usuario_id =
			// Se fija que la identidad esté validada,
			status_registro_id == st_ident_validada_ID
				? // Asigna el rol 'permInputs'
				  roles_us.find((n) => n.perm_inputs && !n.revisor_ents && !n.revisor_us).id
				: // Asigna el rol 'consultas'
				  roles_us.find((n) => !n.perm_inputs).id;

		// Actualiza el usuario
		let objeto = {status_registro_id, rol_usuario_id, fecha_revisores: compartidas.ahora()};
		await BD_genericas.actualizarPorId("usuarios", datos.id, objeto);
		// Aplica la durac_penalidad
		if (durac_penalidad)
			BD_genericas.aumentarElValorDeUnCampo("usuarios", datos.id, "penalizac_acum", durac_penalidad);

		// Libera y vuelve al tablero
		return res.redirect("/inactivar-captura/?entidad=usuarios&id=" + usuario.id + "&origen=tableroUs");
	},
};

let validarContenidoIF = (usuario, avatar) => {
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
		!compartidas.averiguaSiExisteUnArchivo(avatar)
	)
		redireccionar = true;
	// Fin
	return redireccionar;
};
let rutinasIdentGuardar = (campo, usuario, revID, motivo) => {
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
	return;
};
