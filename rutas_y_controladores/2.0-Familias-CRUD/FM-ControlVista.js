"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const variables = require("../../funciones/3-Procesos/Variables");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	inacRecup_Form: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = req.path.slice(1, -1); // códigos posibles: 'inactivar', 'recuperar', 'eliminar'

		// Más variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const revisor = req.session.usuario && req.session.usuario.rol_usuario.revisor_ents;
		let imgDerPers, bloqueDer, cantProds, motivos, procCanoniz, RCLVnombre, prodsDelRCLV;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "sugerido_por", "alta_revisada_por", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidadesProd);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "colecciones" ? "a " : " ";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const preTitulo = codigo.slice(0, 1).toUpperCase() + codigo.slice(1);
		const titulo = preTitulo + " un" + a + entidadNombre;

		// Ayuda para el titulo
		const ayudasTitulo = ["Por favor decinos por qué sugerís " + codigo + " este registro."];

		// Cantidad de productos asociados al RCLV
		if (familia == "rclv") {
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original);
			cantProds = prodsDelRCLV.length;
			procCanoniz = procsRCLV.detalle.procCanoniz(original);
			RCLVnombre = original.nombre;
		}

		// Datos Breves
		bloqueDer =
			familia == "producto"
				? procesos.bloqueRegistro({registro: original, revisor})
				: familia == "rclv"
				? {
						rclv: procsRCLV.detalle.bloqueRCLV({...original, entidad}),
						registro: procesos.bloqueRegistro({registro: {...original, entidad}, revisor, cantProds}),
				  }
				: [];

		// Imagen Derecha
		imgDerPers = procesos.obtieneAvatar(original).orig;

		// Motivos de rechazo
		if (codigo == "inactivar") {
			let petitFamilia = comp.obtieneDesdeEntidad.petitFamilia(entidad);
			motivos = motivos_rech_altas.filter((n) => n[petitFamilia]);
		}

		// Comentario del rechazo
		const comentarios =
			codigo == "recuperar" || codigo == "eliminar"
				? await BD_genericas.obtieneTodosPorCondicion("historial_cambios_de_status", {
						entidad,
						entidad_id: id,
				  }).then((n) => n.map((m) => m.comentario))
				: [];

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await BD_especificas.obtieneCapitulos(original.coleccion_id, original.temporada);
		const status_id = original.status_registro_id;

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen, tituloMotivo: "está Inactivo"},
			...{entidad, id, entidadNombre, familia, comentarios},
			//familias,
			...{registro: original, imgDerPers, bloqueDer, motivos, procCanoniz, RCLVnombre, prodsDelRCLV, status_id},
			cartelGenerico: true,
		});
	},
	inacRecup_Guardar: async (req, res) => {
		// Variables
		const {entidad, id, motivo_id, comentario} = {...req.query, ...req.body};
		const codigo = req.path.slice(1, -1);
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		const status_final_id = codigo == "inactivar" ? inactivar_id : recuperar_id;

		// Revisa errores
		const informacion = procesos.infoIncompleta({motivo_id, comentario, codigo});
		if (informacion) {
			informacion.iconos = variables.vistaEntendido(req.session.urlAnterior);
			return res.render("CMP-0Estructura", {informacion});
		}

		// Comentario para la BD
		let motivoComentario = status_registros.find((n) => n.id == status_final_id).nombre;
		if (comentario) motivoComentario += " - " + comentario;
		if (motivoComentario.endsWith(".")) motivoComentario = motivoComentario.slice(0, -1);

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		let datos = {
			sugerido_por_id: userID,
			sugerido_en: ahora,
			status_registro_id: status_final_id,
		};
		if (codigo == "inactivar") datos.motivo_id = motivo_id;
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Agrega un registro en el historial_cambios_de_status
		let datosHist = {
			...{entidad, entidad_id: id},
			...{sugerido_por_id: original.sugerido_por_id, sugerido_en: original.sugerido_en},
			...{revisado_por_id: userID, revisado_en: ahora},
			...{status_original_id: original.status_registro_id, status_final_id},
			...{aprobado: null, comentario: motivoComentario},
		};
		datosHist.motivo_id = codigo == "inactivar" ? motivo_id : original.motivo_id;
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 3. Actualiza los RCLV, en el campo 'prods_aprob'
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		if (familia == "producto") procesos.cambioDeStatus(entidad, original);

		// 4. Regresa a la vista de detalle
		const destino = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

		return res.redirect(destino);
	},
	eliminarGuardar: async (req, res) => {
		// return res.send(req.query)
		// Variables
		const {entidad, id, origen} = req.query;
		const original = await BD_genericas.obtienePorIdConInclude(entidad, id,asocEdiciones);

		// Se fija si tiene avatar y lo elimina
		// if (original.avatar&&!original.avatar.includes("/"))
		 	// comp.

		// Se fija si tiene ediciones y avatar-edicion y los elimina
		// Acciones si es un producto
		// Se fija si tiene links y los elimina
		// Se fija si tiene links_edic y los elimina
		// Acciones si es un RCLV
		// Se fija si tiene algún producto, y borra el vínculo
		// Se fija si tiene alguna edición-producto, y borra el vínculo
		// Si es un "epoca_del_ano", se fija si tiene algún dia_del_ano y borra el vínculo
		// Elimina el historial de cambios de status
		// Elimina el registro
		// Cartel de registro eliminado
	},
};
