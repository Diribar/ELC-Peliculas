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
		if (familia == "rclv") include.push(...variables.entidades.prods);
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
		const ahora = comp.fechaHora.ahora();
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
		// Variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const original = await BD_genericas.obtienePorId(entidad, id);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const nombreEdicion = comp.obtieneDesdeEntidad.nombreEdicion(entidad);
		let acumulado = [];

		// Se fija si tiene avatar y lo elimina
		if (original.avatar && !original.avatar.includes("/")) {
			console.log(familia, original.avatar);
			comp.gestionArchivos.elimina("./publico/imagenes/2-" + familia + "/Final", original.avatar);
			comp.gestionArchivos.elimina("./publico/imagenes/2-" + familia + "/Revisar", original.avatar);
		}

		// Elimina todas las ediciones que tenga
		acumulado.push(BD_genericas.eliminaTodosPorCondicion(nombreEdicion, {[campo_id]: id}));

		// Elimina el historial de cambios de status
		acumulado.push(BD_genericas.eliminaTodosPorCondicion("historial_cambios_de_status", {entidad, entidad_id: id}));

		// Acciones si es un producto
		if (familia == "producto") {
			// Se fija si tiene links_edicion y links, y los elimina
			acumulado.push(BD_genericas.eliminaTodosPorCondicion("links_edicion", {[campo_id]: id}));
			acumulado.push(BD_genericas.eliminaTodosPorCondicion("links", {[campo_id]: id}));
		}

		// Acciones si es un RCLV
		if (familia == "rclv") {
			// Se fija si tiene alguna edición de producto, y borra el vínculo
			const prodEdiciones = await BD_genericas.obtieneTodosPorCondicion("prods_edicion", {[campo_id]: id});
			if (prodEdiciones.length) {
				await BD_genericas.actualizaTodosPorCondicion("prods_edicion", {[campo_id]: id}, {[campo_id]: null});
				procesos.puleEdicionesProd(prodEdiciones);
			}

			// Borra el vínculo en los productos
			for (let entProd of variables.entidades.prods)
				acumulado.push(BD_genericas.actualizaTodosPorCondicion(entProd, {[campo_id]: id}, {[campo_id]: 1}));

			// Si es un "epoca_del_ano", borra el vínculo en los dias_del_ano
			if (entidad == "epocas_del_ano")
				acumulado.push(
					BD_genericas.actualizaTodosPorCondicion("epocas_del_ano", {epoca_del_ano_id: id}, {[campo_id]: 1})
				);
		}

		// Elimina el registro
		acumulado = await Promise.all(acumulado);
		BD_genericas.eliminaPorId(entidad, id);

		// Prepara información para la próxima vista
		const nombre = original.nombre_castellano
			? original.nombre_castellano
			: original.nombre_original
			? original.nombre_original
			: original.nombre
			? original.nombre
			: "¿ ?";

		// Guarda la información
		let objeto = {entidad, nombre};
		if (origen == "MT") objeto.origen = "MT";
		res.cookie("eliminado", objeto, {maxAge: 5000});

		// Fin
		return res.redirect("/" + familia + "/eliminado");
	},
	eliminadoForm: (req, res) => {
		// Variables
		const {entidad, nombre, origen} = req.cookies && req.cookies.eliminado ? req.cookies.eliminado : {};
		if (!entidad) return res.redirect("/");

		// Más variables
		const articulo = ["peliculas", "colecciones", "epocas_del_ano"].includes(entidad) ? "La " : "El ";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const link = origen == "MT" ? "/mantenimiento" : "/";

		// Cartel de registro eliminado
		const informacion = {
			mensajes: [articulo + entidadNombre + " " + nombre + " fue eliminado/a de nuestra base de datos."],
			iconos: [{nombre: "fa-thumbs-up", link, titulo: "Entendido"}],
			check: true,
		};

		// Fin
		return res.render("CMP-0Estructura", {informacion});
	},
};
