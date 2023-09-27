"use strict";
// ************ Requires *************
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	inacRecup: {
		form: async (req, res) => {
			// Tema y Código
			const {baseUrl, ruta} = comp.reqBasePathUrl(req);
			const codigo1 = ruta.slice(1, -1);
			const tema = baseUrl == "/revision" ? "revisionEnts" : "crud";
			const codigo = baseUrl == "/revision" ? codigo1.slice(codigo1.indexOf("/") + 1) : codigo1; // Resultados  posibles: 'inactivar', 'recuperar', 'eliminar', 'rechazo', 'inactivar-o-recuperar'
			const inactivarRecuperar = codigo == "inactivar-o-recuperar";

			// Más variables
			const {entidad, id} = req.query;
			const origen = req.query.origen ? req.query.origen : "TE";
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
			let imgDerPers, bloqueDer, cantProds, motivos, canonNombre, RCLVnombre, prodsDelRCLV;

			// Obtiene el registro
			let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
			include.push("statusRegistro", "creadoPor", "sugerido_por", "altaRevisadaPor", "motivo");
			if (entidad == "capitulos") include.push("coleccion");
			if (entidad == "colecciones") include.push("capitulos");
			if (familia == "rclv") include.push(...variables.entidades.prods);
			let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

			// Obtiene el subcodigo
			const statusOriginal_id = original.statusRegistro_id;
			const subcodigo =
				statusOriginal_id == inactivar_id ? "inactivar" : statusOriginal_id == recuperar_id ? "recuperar" : "";

			// Obtiene el título
			const a = entidad == "peliculas" || entidad == "colecciones" ? "a " : " ";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			const preTitulo = !inactivarRecuperar
				? codigo.slice(0, 1).toUpperCase() + codigo.slice(1)
				: "Revisión de " + subcodigo.slice(0, 1).toUpperCase() + subcodigo.slice(1);
			const titulo = preTitulo + " un" + a + entidadNombre;

			// Ayuda para el titulo
			const ayudasTitulo = inactivarRecuperar
				? ["Para tomar una decisión contraria a la del usuario, necesitamos tu comentario para darle feedback."]
				: ["Por favor decinos por qué sugerís " + codigo + " este registro."];

			// Cantidad de productos asociados al RCLV
			if (familia == "rclv") {
				prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original);
				cantProds = prodsDelRCLV.length;
				canonNombre = comp.canonNombre(original);
				RCLVnombre = original.nombre;
			}

			// Datos Breves
			bloqueDer = false
				? false
				: tema == "revisionEnts"
				? [
						procesos.bloqueRegistro({...original, entidad}),
						await procesos.fichaDelUsuario(original.statusSugeridoPor_id, petitFamilias),
				  ]
				: familia == "producto"
				? procesos.bloqueRegistro(original)
				: familia == "rclv"
				? {
						rclv: procsRCLV.detalle.bloqueRCLV({...original, entidad}),
						registro: procesos.bloqueRegistro({...original, entidad}),
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
			const status_id = original.statusRegistro_id;
			const urlActual = req.originalUrl;

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, subcodigo, titulo, ayudasTitulo, origen},
				...{entidad, id, entidadNombre, familia, comentarios, urlActual, registro: original},
				...{imgDerPers, bloqueDer, motivos, canonNombre, RCLVnombre, prodsDelRCLV, status_id, cantProds},
				cartelGenerico: true,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, motivo_id} = {...req.query, ...req.body};
			let {comentario: comentUs} = req.body;
			const {ruta} = comp.reqBasePathUrl(req);
			const codigo = ruta.slice(1, -1); // 'inactivar' o 'recuperar'
			const userID = req.session.usuario.id;
			const ahora = comp.fechaHora.ahora();
			const include = comp.obtieneTodosLosCamposInclude(entidad);
			const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
			const statusFinal_id = codigo == "inactivar" ? inactivar_id : recuperar_id;

			// Revisa errores
			const informacion = procesos.infoIncompleta({motivo_id, comentario: comentUs, codigo});
			if (informacion) {
				informacion.iconos = [variables.vistaEntendido(req.session.urlAnterior)];
				return res.render("CMP-0Estructura", {informacion});
			}

			// Comentario para la BD
			let comentario = statusRegistros.find((n) => n.id == statusFinal_id).nombre;

			// Si es 'inactivar', se asegura de que esté la descripción del motivo
			let aux = "";
			if (codigo == "inactivar") {
				const descripcion = motivosStatus.find((n) => n.id == motivo_id).descripcion;
				if (!comentUs || !comentUs.startsWith(descripcion)) aux = descripcion + ": ";
			}
			comentario += " - " + aux + comentUs;
			if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

			// CONSECUENCIAS
			// 1. Actualiza el status en el registro original
			let datos = {
				statusSugeridoPor_id: userID,
				statusSugeridoEn: ahora,
				statusRegistro_id: statusFinal_id,
			};
			if (codigo == "inactivar") datos.motivo_id = motivo_id;
			await BD_genericas.actualizaPorId(entidad, id, datos);

			// 2. Si es una colección, actualiza sus capítulos con el mismo status
			if (entidad == "colecciones")
				BD_genericas.actualizaTodosPorCondicion(
					"capitulos",
					{coleccion_id: id},
					{...datos, statusColeccion_id: statusFinal_id, statusSugeridoPor_id: usAutom_id}
				);

			// 3. Agrega un registro en el histStatus
			let datosHist = {
				...{entidad, entidad_id: id},
				...{sugeridoPor_id: original.statusSugeridoPor_id, sugeridoEn: original.statusSugeridoEn},
				...{revisadoPor_id: userID, revisadoEn: ahora},
				...{statusOriginal_id: original.statusRegistro_id, statusFinal_id},
				comentario,
			};
			datosHist.motivo_id = codigo == "inactivar" ? motivo_id : original.motivo_id;
			BD_genericas.agregaRegistro("histStatus", datosHist);

			// 4. Actualiza los RCLV, en el campo 'prodsAprob'
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			if (familia == "producto") procesos.revisiones.accionesPorCambioDeStatus(entidad, original);

			// 5. Regresa a la vista de detalle
			const destino = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

			return res.redirect(destino);
		},
	},
	eliminar: async (req, res) => {
		// Variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const original =
			entidad == "colecciones"
				? await BD_genericas.obtienePorIdConInclude("colecciones", id, "capitulos")
				: await BD_genericas.obtienePorId(entidad, id);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let esperar = [];

		// 1. Elimina las ediciones propias y sus archivos avatar
		esperar.push(procesos.eliminar.eliminaAvatarMasEdics(entidad, id));

		// 2. Elimina los links y sus ediciones
		if (familia == "producto")
			esperar.push(procesos.eliminar.eliminaDependsMasEdics({entidadPadre: entidad, padreID: id, entidadHijo: "links"}));

		// 3. Elimina los capítulos, sus ediciones y sus links
		if (entidad == "colecciones") {
			// Variables
			let esperarCapitulos = [];

			// Borra los links de los capítulos
			for (let capitulo of original.capitulos)
				esperarCapitulos.push(
					procesos.eliminar.eliminaDependsMasEdics({
						entidadPadre: "capitulos",
						padreID: capitulo.id,
						entidadHijo: "links",
					})
				);

			// Espera a que se borren todas las dependencias de los capítulos
			await Promise.all(esperarCapitulos);

			// Elimina los capítulos
			esperar.push(
				procesos.eliminar.eliminaDependsMasEdics({entidadPadre: entidad, padreID: id, entidadHijo: "capitulos"})
			);
		}

		// 4. Borra el vínculo en las ediciones de producto y las elimina si quedan vacías
		if (familia == "rclv") esperar.push(procesos.eliminar.borraVinculoEdicsProds({entidadRCLV: entidad, rclvID: id}));

		// 5. Borra el vínculo en los productos y les baja de status si corresponde
		if (familia == "rclv") esperar.push(procesos.eliminar.borraVinculoProds({entidadRCLV: entidad, rclvID: id}));

		// 6. Borra el vínculo en los fechasDelAno
		if (entidad == "epocasDelAno")
			esperar.push(BD_genericas.actualizaTodosPorCondicion("fechasDelAno", {[campo_id]: id}, {[campo_id]: 1}));

		// Elimina el registro
		await Promise.all(esperar);
		await BD_genericas.eliminaPorId(entidad, id);

		// Elimina el historial de status
		BD_genericas.eliminaTodosPorCondicion("histStatus", {entidad, entidad_id: id});

		// Elimina el historial de ediciones
		BD_genericas.eliminaTodosPorCondicion("histEdics", {entidad, entidad_id: id});

		// Se fija si tiene avatar y lo elimina
		if (original.avatar && !original.avatar.includes("/")) {
			const carpeta = (familias == "productos" ? "2-" : "3-") + familias;
			comp.gestionArchivos.elimina("./publico/archSinVersion/" + carpeta + "/Final", original.avatar);
			comp.gestionArchivos.elimina("./publico/archSinVersion/" + carpeta + "/Revisar", original.avatar);
		}

		// Guarda la información para la próxima vista
		const nombre = comp.nombresPosibles(original);
		let objeto = {entidad, nombre};
		if (origen == "TM") objeto.origen = "TM";
		res.cookie("eliminado", objeto, {maxAge: 5000});

		// Fin
		return res.redirect("/" + familia + "/eliminado");
	},
	eliminado: (req, res) => {
		// Variables
		const {entidad, nombre, origen} = req.cookies && req.cookies.eliminado ? req.cookies.eliminado : {};
		if (!entidad) return res.redirect("/");

		// Más variables
		const articulo1 = ["peliculas", "colecciones", "epocasDelAno"].includes(entidad) ? "La " : "El ";
		const articulo2 = articulo1 == "La " ? "a" : "o";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
		const capitulos = entidad == "colecciones" ? "y sus capítulos, " : "";
		const plural1 = entidad == "colecciones" ? "ron" : "";
		const plural2 = entidad == "colecciones" ? "s" : "";
		const link = origen == "TM" ? "/mantenimiento" : "/";

		// Cartel de registro eliminado
		const informacion = {
			mensajes: [
				articulo1 +
					entidadNombre +
					' "' +
					nombre +
					'" ' +
					capitulos +
					"fue" +
					plural1 +
					" eliminad" +
					articulo2 +
					plural2 +
					" de nuestra base de datos.",
			],
			iconos: [{nombre: "fa-thumbs-up", link, titulo: "Entendido"}],
			check: true,
		};

		// Fin
		return res.render("CMP-0Estructura", {informacion});
	},
};
