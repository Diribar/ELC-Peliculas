"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const procesos = require("./RU-Procesos");
// const valida = require("./FN-Validar");

module.exports = {
	// Revisión
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionUs";
		const codigo = "tableroControl";
		const revID = req.session.usuario.id;

		// Obtiene las solicitudes de Permiso de Input
		const usuarios = {validaIdentidades: await procesos.TC.validaIdentidades(revID)};

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
	identidadForm: async (req, res) => {
		// Variables
		const tema = "revisionUs";
		const codigo = "validaIdentidad";
		const userID = req.query.id;
		const campos = [
			{titulo: "País de Expedición", nombre: "docum_pais_id"},
			{titulo: "Apellido", nombre: "apellido"},
			{titulo: "Nombre", nombre: "nombre"},
			{titulo: "Sexo", nombre: "sexo_id"},
			{titulo: "Fecha de Nacim.", nombre: "fecha_nacim"},
			{titulo: "N° de Documento", nombre: "docum_numero"},
		];

		// Obtiene el usuario
		const usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, ["sexo", "rolUsuario", "status_registro"]);

		// Validaciones
		const {informacion, docum_avatar} = procesos.IF.validaUsuario(usuario, campos);
		if (informacion) return res.render("CMP-0Estructura", {informacion});

		// Otras variables
		const pais = paises.find((n) => n.id == usuario.docum_pais_id).nombre;
		const fecha_nacim = comp.fechaHora.fechaDiaMesAno(usuario.fecha_nacim);
		const valores = {
			docum_pais_id: pais,
			apellido: usuario.apellido,
			nombre: usuario.nombre,
			sexo_id: usuario.sexo.nombre,
			fecha_nacim: fecha_nacim,
			docum_numero: usuario.docum_numero,
		};
		for (let campo of campos) campo.valor = valores[campo.nombre];
		const motivos_docum = motivos_edics.filter((n) => n.avatar_us);

		// 4. Va a la vista
		// return res.send(campos)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Validación de Identidad",
			usuario,
			avatar: "/imagenes/0-Base/ImagenDerecha.jpg",
			docum_avatar,
			title: usuario.apodo,
			campos,
			userID,
			motivos_docum,
			cartelGenerico: true,
		});
	},
	identidadGuardar: async (req, res) => {
		// Toma los datos del formulario
		let datos = {...req.query, ...req.body};
		// Si no se respondió algún campo necesario, avisa que se debe reenviar el formulario
		let redireccionar;
		if (datos.motivo_docum_id == "0") {
			let campos = ["docum_pais_id", "apellido", "nombre", "sexo_id", "fecha_nacim", "docum_numero"];
			for (let campo of campos) if (!Object.keys(req.body).includes(campo)) redireccionar = true;
		}
		// Si no se respondió el motivo, avisa que se debe reenviar el formulario
		else if (!datos.motivo_docum_id) redireccionar = true;
		// Si hubo algún error en el data-entry reenvía el formulario
		if (redireccionar) return res.redirect(req.originalUrl);

		// Variables de usuarios
		let usuario = await BD_genericas.obtienePorId("usuarios", datos.id);
		let revID = req.session.usuario.id;
		// Variables de motivos
		let durac_penalidad = 0;
		// Variables de 'status de registro'
		let st_editables_ID = status_registro_us.find((n) => n.editables).id;
		let st_ident_validada_ID = status_registro_us.find((n) => n.ident_validada).id;
		let status_registro_id = st_ident_validada_ID;
		// Informacion a agregarle al usuario
		let objeto = {fecha_revisores: comp.fechaHora.ahora()};

		// Acciones si la imagen del documento fue aprobada
		if (datos.motivo_docum_id == "0") {
			// Rutinas para los demás campos --> lleva al status 'editables'
			let campos = ["docum_pais_id", "docum_numero", "nombre", "apellido", "sexo_id", "fecha_nacim"];
			// Motivo genérico
			let motivo = motivos_edics.find((n) => n.info_erronea);
			for (let campo of campos)
				if (datos[campo] == "NO") {
					// Agrega un registro por la edición rechazada
					procesos.usuarioEdicRech(campo, usuario, revID, motivo);
					status_registro_id = st_editables_ID;
					durac_penalidad += Number(motivo.duracion);
				}
		}
		// Acciones si la imagen del documento NO fue aprobada
		else {
			// Rutinas para el campo
			let motivo = motivos_edics.find((n) => n.id == datos.motivo_docum_id);
			procesos.usuarioEdicRech("docum_avatar", usuario, revID, motivo);
			status_registro_id = st_editables_ID;
			durac_penalidad += motivo.duracion;
		}
		// Acciones si se aprueba la validación
		if (status_registro_id == st_ident_validada_ID) {
			// Asigna el rol 'permInputs'
			let rolPermInputs_id = roles_us.find((n) => n.permInputs && !n.revisorEnts && !n.revisorUs).id;
			objeto.rol_usuario_id = rolPermInputs_id;
			// Mueve la imagen del documento a su carpeta definitiva
			comp.gestionArchivos.mueveImagen(usuario.docum_avatar, "1-Usuarios/2-DNI-Revisar", "1-Usuarios/2-DNI-Final");
		}
		// Actualiza el usuario
		objeto = {...objeto, status_registro_id};
		BD_genericas.actualizaPorId("usuarios", datos.id, objeto);
		// Aplica la durac_penalidad
		if (durac_penalidad) BD_genericas.aumentaElValorDeUnCampo("usuarios", datos.id, "penalizac_acum", durac_penalidad);
		// Libera y vuelve al tablero
		return res.redirect("/inactivar-captura/?entidad=usuarios&id=" + usuario.id + "&origen=TU");
	},
};
