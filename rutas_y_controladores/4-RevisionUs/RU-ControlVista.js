"use strict";
// Definir variables
const BD_genericas = require("../../funciones/1-BD/Genericas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const variables = require("../../funciones/2-Procesos/Variables");
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
	validaIdent: {
		form: async (req, res) => {
			// Variables
			const tema = "revisionUs";
			const codigo = "validaIdentidad";
			const userID = req.query.id;
			const campos = variables.camposRevisar.usuarios;

			// Obtiene datos para la vista
			const usuario = await BD_genericas.obtienePorIdConInclude("usuarios", userID, "sexo");
			const valores = {
				documPais_id: paises.find((n) => n.id == usuario.documPais_id).nombre,
				apellido: usuario.apellido,
				nombre: usuario.nombre,
				sexo_id: usuario.sexo.nombre,
				fechaNacim: comp.fechaHora.fechaDiaMesAno(usuario.fechaNacim),
				documNumero: usuario.documNumero,
			};
			for (let campo of campos) campo.valor = valores[campo.nombre];
			const documAvatar = "/archSinVersion/1-Usuarios/DNI-Revisar/" + usuario.documAvatar;
			const motivos_docum = motivosEdics.filter((n) => n.avatar_us);

			// 4. Va a la vista
			// return res.send(campos)
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Validación de Identidad",
				motivos_docum,
				campos,
				documAvatar,
				userID,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const datos = {...req.query, ...req.body};
			const campos = variables.camposRevisar.usuarios;
			const motivo =
				datos.motivo_docum_id == "0"
					? motivoInfoErronea
					: datos.motivo_docum_id
					? motivosEdics.find((n) => n.id == datos.motivo_docum_id)
					: "";
			let redireccionar;

			// Si hubo algún error en el data-entry, recarga la vista
			if (datos.motivo_docum_id == "0") {
				for (let campo of campos) if (!Object.keys(req.body).includes(campo.nombre)) redireccionar = true; // Si el documento está bien, revisa que no falten datos
			} else if (!motivo) redireccionar = true; // Revisa que haya un motivo válido
			if (redireccionar) return res.redirect(req.originalUrl);

			// Más variables
			const usuario = await BD_genericas.obtienePorId("usuarios", datos.id);
			const revID = req.session.usuario.id;
			let penalizac = 0;
			let statusRegistro_id = stIdentValidada_id;
			let objeto = {fechaRevisores: comp.fechaHora.ahora()};

			// Acciones si la imagen del documento fue aprobada
			if (datos.motivo_docum_id == "0") {
				for (let campo of campos)
					if (datos[campo] == "NO") {
						// Agrega un registro por la edición rechazada
						procesos.VI.histEdics({campo, usuario, revID, motivo});
						statusRegistro_id = stUsRegistrado_id;
						penalizac += Number(motivo.penalizac);
					}
			}
			// Acciones si la imagen del documento NO fue aprobada
			else {
				// Rutinas para el campo
				procesos.VI.histEdics({campo: {titulo: "Imagen del documento", nombre: "documAvatar"}, usuario, revID, motivo});
				statusRegistro_id = stUsRegistrado_id;
				penalizac += Number(motivo.penalizac);
			}

			// Acciones si se aprueba la validación
			if (statusRegistro_id == stIdentValidada_id) {
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
	},
};
