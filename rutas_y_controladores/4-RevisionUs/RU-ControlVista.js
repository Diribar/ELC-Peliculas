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
	validaIdentForm: async (req, res) => {
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
		const {informacion, docum_avatar} = procesos.VI.validaUsuario(usuario, campos);
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
			avatar: "/imagenes/0-Base/ImagenDerecha.jpg",
			docum_avatar,
			title: usuario.apodo,
			campos,
			userID,
			motivos_docum,
			cartelGenerico: true,
		});
	},
	validaIdentGuardar: async (req, res) => {
		// Variables
		const datos = {...req.query, ...req.body};
		const campos = ["apellido", "docum_pais_id", "docum_numero", "fecha_nacim", "nombre", "sexo_id"];

		// Si hubo algún error en el data-entry reenvía el formulario
		let redireccionar;
		if (datos.motivo_docum_id == "0") {
			for (let campo of campos) if (!Object.keys(req.body).includes(campo)) redireccionar = true;
		} else if (!datos.motivo_docum_id) redireccionar = true;
		if (redireccionar) return res.redirect(req.originalUrl);

		// Más variables
		const revID = req.session.usuario.id;
		let durac_penalidad = 0;
		let status_registro_id = st_ident_validada_id;
		let objeto = {fechaRevisores: comp.fechaHora.ahora()};

		// Obtiene el usuario
		const usuario = await BD_genericas.obtienePorId("usuarios", datos.id);

		// Acciones si la imagen del documento fue aprobada
		if (datos.motivo_docum_id == "0") {
			const motivo = motivos_edics.find((n) => n.info_erronea);
			for (let campo of campos)
				if (datos[campo] == "NO") {
					// Agrega un registro por la edición rechazada
					procesos.VI.hist_edics(campo, usuario, revID, motivo);
					status_registro_id = st_editables_id;
					durac_penalidad += Number(motivo.duracion);
				}
		}
		// Acciones si la imagen del documento NO fue aprobada
		else {
			// Rutinas para el campo
			const motivo = motivos_edics.find((n) => n.id == datos.motivo_docum_id);
			procesos.VI.hist_edics("docum_avatar", usuario, revID, motivo);
			status_registro_id = st_editables_id;
			durac_penalidad += Number(motivo.duracion);
		}

		// Acciones si se aprueba la validación
		if (status_registro_id == st_ident_validada_id) {
			// Asigna el rol 'permInputs'
			objeto.rol_usuario_id = rolPermInputs_id;

			// Mueve la imagen del documento a su carpeta definitiva
			comp.gestionArchivos.mueveImagen(usuario.docum_avatar, "1-Usuarios/DNI-Revisar", "1-Usuarios/DNI-Final");
		}

		// Actualiza el usuario
		objeto.status_registro_id = status_registro_id;
		BD_genericas.actualizaPorId("usuarios", datos.id, objeto);

		// Aplica la durac_penalidad
		if (durac_penalidad) BD_genericas.aumentaElValorDeUnCampo("usuarios", datos.id, "penalizacAcum", durac_penalidad);

		// Vuelve al tablero
		return res.redirect("/revision/usuarios/tablero-de-control");
	},
};
