"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesos = require("./RU-Procesos");

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
		const campos = variables.camposRevisar.usuarios

		// Obtiene el usuario y variables dependientes
		const usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, ["sexo", "rolUsuario", "statusRegistro"]);
		const documPais_id = paises.find((n) => n.id == usuario.documPais_id).nombre;
		const fechaNacim = comp.fechaHora.fechaDiaMesAno(usuario.fechaNacim);
		const valores = {
			documPais_id,
			apellido: usuario.apellido,
			nombre: usuario.nombre,
			sexo_id: usuario.sexo.nombre,
			fechaNacim,
			documNumero: usuario.documNumero,
		};
		for (let campo of campos) campo.valor = valores[campo.nombre];
		const motivos_docum = motivosEdics.filter((n) => n.avatar_us);

		// 4. Va a la vista
		// return res.send(campos)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Validación de Identidad",
			avatar: "/imagenes/0-Base/ImagenDerecha.jpg",
			documAvatar,
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
		const campos = ["apellido", "documPais_id", "documNumero", "fechaNacim", "nombre", "sexo_id"];

		// Si hubo algún error en el data-entry reenvía el formulario
		let redireccionar;
		if (datos.motivo_docum_id == "0") {
			for (let campo of campos) if (!Object.keys(req.body).includes(campo)) redireccionar = true;
		} else if (!datos.motivo_docum_id) redireccionar = true;
		if (redireccionar) return res.redirect(req.originalUrl);

		// Más variables
		const revID = req.session.usuario.id;
		let penalizac = 0;
		let statusRegistro_id = st_ident_validada_id;
		let objeto = {fechaRevisores: comp.fechaHora.ahora()};

		// Obtiene el usuario
		const usuario = await BD_genericas.obtienePorId("usuarios", datos.id);

		// Acciones si la imagen del documento fue aprobada
		if (datos.motivo_docum_id == "0") {
			const motivo = motivosEdics.find((n) => n.info_erronea);
			for (let campo of campos)
				if (datos[campo] == "NO") {
					// Agrega un registro por la edición rechazada
					procesos.VI.histEdics(campo, usuario, revID, motivo);
					statusRegistro_id = st_editables_id;
					penalizac += Number(motivo.penalizac);
				}
		}
		// Acciones si la imagen del documento NO fue aprobada
		else {
			// Rutinas para el campo
			const motivo = motivosEdics.find((n) => n.id == datos.motivo_docum_id);
			procesos.VI.histEdics("documAvatar", usuario, revID, motivo);
			statusRegistro_id = st_editables_id;
			penalizac += Number(motivo.penalizac);
		}

		// Acciones si se aprueba la validación
		if (statusRegistro_id == st_ident_validada_id) {
			// Asigna el rol 'permInputs'
			objeto.rolUsuario_id = rolPermInputs_id;

			// Mueve la imagen del documento a su carpeta definitiva
			comp.gestionArchivos.mueveImagen(usuario.documAvatar, "1-Usuarios/DNI-Revisar", "1-Usuarios/DNI-Final");
		}

		// Actualiza el usuario
		objeto.statusRegistro_id = statusRegistro_id;
		BD_genericas.actualizaPorId("usuarios", datos.id, objeto);

		// Aplica la penalizac
		if (penalizac) BD_genericas.aumentaElValorDeUnCampo("usuarios", datos.id, "penalizacAcum", penalizac);

		// Vuelve al tablero
		return res.redirect("/revision/usuarios/tablero-de-control");
	},
};
