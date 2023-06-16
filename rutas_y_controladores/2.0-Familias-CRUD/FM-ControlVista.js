"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const variables = require("../../funciones/1-Procesos/Variables");
const comp = require("../../funciones/1-Procesos/Compartidas");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	inacRecup_Form: async (req, res) => {
		// Tema y Código
		const tema = req.baseUrl == "/revision" ? "revisionEnts" : "crud";
		const codigo1 = req.path.slice(1, -1);
		const codigo = tema == "revisionEnts" ? codigo1.slice(codigo1.indexOf("/") + 1) : codigo1; // Resultados  posibles: 'inactivar', 'recuperar', 'eliminar', 'rechazo', 'inactivar-o-recuperar'
		const inactivarRecuperar = codigo == "inactivar-o-recuperar";

		// Más variables
		const {entidad, id} = req.query;
		const origen = req.query.origen ? req.query.origen : "TE";
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;
		let imgDerPers, bloqueDer, cantProds, motivos, procCanoniz, RCLVnombre, prodsDelRCLV;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("statusRegistro", "creado_por", "sugerido_por", "alta_revisada_por", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el subcodigo
		const statusOriginal_id = original.statusRegistro_id;
		const subcodigo = statusOriginal_id == inactivar_id ? "inactivar" : statusOriginal_id == recuperar_id ? "recuperar" : "";

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "colecciones" ? "a " : " ";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const preTitulo = codigo.slice(0, 1).toUpperCase() + codigo.slice(1).replaceAll("-", " ").replace("recup", "Recup");
		const titulo = preTitulo + " un" + a + entidadNombre;

		// Ayuda para el titulo
		const ayudasTitulo = inactivarRecuperar
			? ["Para tomar una decisión contraria a la del usuario, necesitamos tu comentario para darle feedback."]
			: ["Por favor decinos por qué sugerís " + codigo + " este registro."];

		// Cantidad de productos asociados al RCLV
		if (familia == "rclv") {
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original);
			cantProds = prodsDelRCLV.length;
			procCanoniz = procsRCLV.detalle.procCanoniz(original);
			RCLVnombre = original.nombre;
		}

		// Datos Breves
		bloqueDer = false
			? false
			: tema == "revisionEnts"
			? [
					procesos.bloqueRegistro({registro: {...original, entidad}, revisor, cantProds}),
					await procesos.fichaDelUsuario(original.sugeridoPor_id, petitFamilias),
			  ]
			: familia == "producto"
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
		if (codigo == "inactivar" || codigo == "rechazo") motivos = motivosStatus.filter((n) => n[petitFamilias]);

		// Comentario del rechazo
		const comentarios =
			inactivarRecuperar || codigo == "recuperar" || codigo == "eliminar"
				? await BD_genericas.obtieneTodosPorCondicion("histStatus", {entidad, entidad_id: id}).then((n) =>
						n.map((m) => m.comentario)
				  )
				: [];

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await BD_especificas.obtieneCapitulos(original.coleccion_id, original.temporada);
		const tituloMotivo =
			subcodigo == "recuperar" ? "estuvo 'Inactivo'" : subcodigo == "inactivar" ? "está en 'Inactivar'" : "está Inactivo";
		const status_id = original.statusRegistro_id;
		const urlActual = req.originalUrl;

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, subcodigo, titulo, ayudasTitulo, origen, tituloMotivo},
			...{entidad, id, entidadNombre, familia, comentarios, urlActual},
			...{registro: original, imgDerPers, bloqueDer, motivos, procCanoniz, RCLVnombre, prodsDelRCLV, status_id, cantProds},
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
		const statusFinal_id = codigo == "inactivar" ? inactivar_id : recuperar_id;

		// Revisa errores
		const informacion = procesos.infoIncompleta({motivo_id, comentario, codigo});
		if (informacion) {
			informacion.iconos = variables.vistaEntendido(req.session.urlAnterior);
			return res.render("CMP-0Estructura", {informacion});
		}

		// Comentario para la BD
		let motivoComentario = status_registros.find((n) => n.id == statusFinal_id).nombre;
		if (comentario) motivoComentario += " - " + comentario;
		if (motivoComentario.endsWith(".")) motivoComentario = motivoComentario.slice(0, -1);

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		let datos = {
			sugeridoPor_id: userID,
			sugeridoEn: ahora,
			statusRegistro_id: statusFinal_id,
		};
		if (codigo == "inactivar") datos.motivo_id = motivo_id;
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Agrega un registro en el histStatus
		let datosHist = {
			...{entidad, entidad_id: id},
			...{sugeridoPor_id: original.sugeridoPor_id, sugeridoEn: original.sugeridoEn},
			...{revisadoPor_id: userID, revisadoEn: ahora},
			...{statusOriginal_id: original.statusRegistro_id, statusFinal_id},
			...{aprobado: null, comentario: motivoComentario},
		};
		datosHist.motivo_id = codigo == "inactivar" ? motivo_id : original.motivo_id;
		BD_genericas.agregaRegistro("histStatus", datosHist);

		// 3. Actualiza los RCLV, en el campo 'prodsAprob'
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		if (familia == "producto") procesos.revisiones.accionesPorCambioDeStatus(entidad, original);

		// 4. Regresa a la vista de detalle
		const destino = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

		return res.redirect(destino);
	},
	eliminadoForm: (req, res) => {
		// Variables
		const {entidad, nombre, origen} = req.cookies && req.cookies.eliminado ? req.cookies.eliminado : {};
		if (!entidad) return res.redirect("/");

		// Más variables
		const articulo1 = ["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? "La " : "El ";
		const articulo2 = articulo1 == "La " ? "a" : "o";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
		const link = origen == "TM" ? "/mantenimiento" : "/";

		// Cartel de registro eliminado
		const informacion = {
			mensajes: [articulo1 + entidadNombre + ' "' + nombre + '" fue eliminad' + articulo2 + " de nuestra base de datos."],
			iconos: [{nombre: "fa-thumbs-up", link, titulo: "Entendido"}],
			check: true,
		};

		// Fin
		return res.render("CMP-0Estructura", {informacion});
	},
	eliminarGuardar: async (req, res) => {
		// Variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const original = await BD_genericas.obtienePorId(entidad, id);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const entidadEdic = comp.obtieneDesdeEntidad.entidadEdic(entidad);
		let esperar = [];

		// ELIMINA DEPENDIENTES
		// 1. Elimina las ediciones propias
		esperar.push(BD_genericas.eliminaTodosPorCondicion(entidadEdic, {[campo_id]: id}));

		// 2. Elimina los links y sus ediciones
		if (familia == "producto")
			esperar.push(procesos.eliminar.eliminaRegsMasEdics({entidadPadre: entidad, padreID: id, entidadHijo: "links"}));

		// 3. Elimina los capítulos y sus ediciones
		if (entidad == "colecciones")
			esperar.push(procesos.eliminar.eliminaRegsMasEdics({entidadPadre: entidad, padreID: id, entidadHijo: "capitulos"}));

		// 4. Borra el vínculo en las ediciones de producto y las elimina si quedan vacías
		if (familia == "rclv") esperar.push(procesos.eliminar.borraVinculoEdicsProds({entidadRCLV: entidad, rclvID: id}));

		// 5. Borra el vínculo en los productos y les baja de status si corresponde
		if (familia == "rclv") esperar.push(procesos.eliminar.borraVinculoProds({entidadRCLV: entidad, rclvID: id}));

		// 6. Borra el vínculo en los diasDelAno
		if (entidad == "epocasDelAno")
			esperar.push(BD_genericas.actualizaTodosPorCondicion("diasDelAno", {[campo_id]: id}, {[campo_id]: 1}));

		// TAREAS QUE NO IMPIDEN ELIMINAR EL REGISTRO
		// 1. Elimina el historial de status
		BD_genericas.eliminaTodosPorCondicion("histStatus", {entidad, entidad_id: id});

		// 2. Elimina el historial de ediciones
		BD_genericas.eliminaTodosPorCondicion("histEdics", {entidad, entidad_id: id});

		// 3. Se fija si tiene avatar y lo elimina
		if (original.avatar && !original.avatar.includes("/")) {
			comp.gestionArchivos.elimina("./publico/imagenes/2-" + familias + "/Final", original.avatar);
			comp.gestionArchivos.elimina("./publico/imagenes/2-" + familias + "/Revisar", original.avatar);
		}

		// Espera a que se cumplan todas las rutinas anteriores
		await Promise.all(esperar);

		// Elimina el registro
		BD_genericas.eliminaPorId(entidad, id);

		// Guarda la información para la próxima vista
		const nombre = comp.nombresPosibles(original);
		let objeto = {entidad, nombre};
		if (origen == "TM") objeto.origen = "TM";
		res.cookie("eliminado", objeto, {maxAge: 5000});

		// Fin
		return res.redirect("/" + familia + "/eliminado");
	},
};
