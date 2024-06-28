"use strict";
// Variables
const procsRCLV = require("../2.2-RCLVs/RCLV-FN-Procesos");
const procesos = require("./FM-FN-Procesos");
const validacs = require("./FM-FN-Validar");

module.exports = {
	inactivarRechazar_form: async (req, res) => {
		// Tema
		const {baseUrl, ruta} = comp.reqBasePathUrl(req);
		const tema = baseUrl == "/revision" ? "revisionEnts" : "fmCrud";
		const codigo = ruta.slice(1, -1).replace("revision/", ""); // 'inactivar', 'rechazar'

		// Más variables
		const {entidad, id} = req.query;
		const origen = req.query.origen;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const userID = req.session.usuario.id;
		let imgDerPers, bloqueDer, cantProds, motivos, canonNombre, RCLVnombre, prodsDelRCLV, historialStatus;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("statusRegistro", "creadoPor", "statusSugeridoPor", "altaRevisadaPor", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await baseDeDatos.obtienePorId(entidad, id, include);

		// Cantidad de productos asociados al RCLV
		if (familia == "rclv") {
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original, userID);
			cantProds = prodsDelRCLV.length;
			canonNombre = comp.canonNombre(original);
			RCLVnombre = original.nombre;
		}

		// Datos Breves
		bloqueDer = await procesos.bloques.consolidado({tema, familia, entidad, original});

		// Imagen Derecha
		imgDerPers = procesos.obtieneAvatar(original).orig;

		// Motivos de rechazo
		if (["inactivar", "rechazar"].includes(codigo)) motivos = motivosStatus.filter((n) => n[petitFamilias]);

		// Recuperar/Eliminar y Revisiones - completa el historial de status
		if (!activos_ids.includes(original.statusRegistro_id))
			historialStatus = await procesos.historialDeStatus.obtiene({entidad, ...original});

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await procesos.obtieneCapitulos(original.coleccion_id, original.temporada);
		const status_id = original.statusRegistro_id;
		const urlActual = req.originalUrl;
		const entidades = variables.entidades[petitFamilias];
		const entsNombre = variables.entidades[petitFamilias + "Nombre"];
		const ayudasTitulo = "Por favor decinos por qué sugerís " + codigo + " este registro.";
		const {titulo,entidadNombre} = procesos.titulo({entidad, codigo});

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{entidad, entidadNombre, familia, id, registro: original, historialStatus},
			...{canonNombre, RCLVnombre, prodsDelRCLV, imgDerPers, bloqueDer, status_id, cantProds},
			...{entidades, entsNombre, motivos, urlActual},
			cartelGenerico: true,
		});
	},
	inacRecupElim_form: async (req, res) => {
		// Tema
		const {baseUrl, ruta} = comp.reqBasePathUrl(req);
		const tema = baseUrl == "/revision" ? "revisionEnts" : "fmCrud";

		// Código
		let codigo = ruta.slice(1, -1).replace("revision/", ""); // 'inactivar', 'rechazar', 'recuperar', 'eliminar', 'inactivar-o-recuperar'
		if (["inactivar", "rechazar"].includes(codigo)) codigo = "aInactivo";
		const inactivarRecuperar = codigo == "inactivar-o-recuperar";

		// Más variables
		const {entidad, id} = req.query;
		const origen = req.query.origen ? req.query.origen : "TE";
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);
		const userID = req.session.usuario.id;
		let imgDerPers, bloqueDer, cantProds, motivos, canonNombre, RCLVnombre, prodsDelRCLV, historialStatus;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("statusRegistro", "creadoPor", "statusSugeridoPor", "altaRevisadaPor", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidades.prods);
		let original = await baseDeDatos.obtienePorId(entidad, id, include);

		// Obtiene el subcodigo
		const statusOriginal_id = original.statusRegistro_id;
		const subcodigo = statusOriginal_id == inactivar_id ? "inactivar" : statusOriginal_id == recuperar_id ? "recuperar" : "";

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
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original, userID);
			cantProds = prodsDelRCLV.length;
			canonNombre = comp.canonNombre(original);
			RCLVnombre = original.nombre;
		}

		// Datos Breves
		bloqueDer =
			tema == "revisionEnts"
				? {
						registro: await procesos.bloques.registro({...original, entidad}),
						usuario: await procesos.bloques.usuario(original.statusSugeridoPor_id, petitFamilias),
				  }
				: familia == "producto"
				? {producto: true, registro: await procesos.bloques.registro({...original, entidad})}
				: familia == "rclv"
				? {
						rclv: procesos.bloques.rclv({...original, entidad}),
						registro: await procesos.bloques.registro({...original, entidad}),
				  }
				: {};

		// Imagen Derecha
		imgDerPers = procesos.obtieneAvatar(original).orig;

		// Motivos de rechazo
		if (["inactivar", "rechazar"].includes(codigo)) motivos = motivosStatus.filter((n) => n[petitFamilias]);

		// Recuperar/Eliminar y Revisiones - completa el historial de status
		if (!activos_ids.includes(original.statusRegistro_id))
			historialStatus = await procesos.historialDeStatus.obtiene({entidad, ...original});

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await procesos.obtieneCapitulos(original.coleccion_id, original.temporada);
		const status_id = original.statusRegistro_id;
		const urlActual = req.originalUrl;
		const entidades = variables.entidades[petitFamilias];
		const entsNombre = variables.entidades[petitFamilias + "Nombre"];

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, subcodigo, titulo, ayudasTitulo, origen},
			...{entidad, entidadNombre, familia, id, registro: original, historialStatus},
			...{canonNombre, RCLVnombre, prodsDelRCLV, imgDerPers, bloqueDer, status_id, cantProds},
			...{entidades, entsNombre, motivos, urlActual},
			cartelGenerico: true,
		});
	},

	inacRecup_guardar: async (req, res) => {
		//  iniciales
		let datos = await obtieneDatos(req);
		const {entidad, id, familia, motivo_id, codigo, userID, ahora, campo_id, original, statusFinal_id} = datos;

		// Acciones con comentario
		let comentario = req.body && req.body.comentario ? req.body.comentario : "";
		if (comentario.endsWith(".")) comentario = comentario.slice(0, -1);

		// Acciones particulares si el nuevo status es 'inactivar_id'
		if (codigo == "inactivar") {
			// Si el comentario está restringido, lo descarta
			const motivo = motivosStatus.find((n) => n.id == motivo_id);
			if (!motivo.agregarComent) comentario = "";
		}

		// CONSECUENCIAS - Actualiza el status en el registro original
		datos = {
			statusSugeridoPor_id: userID,
			statusSugeridoEn: ahora,
			statusRegistro_id: statusFinal_id,
		};
		if (codigo == "inactivar") datos.motivo_id = motivo_id;
		await baseDeDatos.actualizaPorId(entidad, id, datos);

		// CONSECUENCIAS - Agrega un registro en el histStatus
		let datosHist = {
			...{entidad, entidad_id: id}, // entidad
			...{statusOriginalPor_id: original.statusSugeridoPor_id, statusFinalPor_id: userID}, // personas
			...{statusOriginal_id: original.statusRegistro_id, statusFinal_id}, // status
			...{statusOriginalEn: original.statusSugeridoEn}, // fecha
			comentario,
		};
		datosHist.motivo_id = codigo == "inactivar" ? motivo_id : original.motivo_id;
		baseDeDatos.agregaRegistro("histStatus", datosHist);

		// CONSECUENCIAS - Acciones si es un producto
		if (familia == "producto") {
			// 1. Actualiza en los links el campo 'prodAprob'
			const asoc = comp.obtieneDesdeEntidad.asociacion(entidad);
			const links = await baseDeDatos.obtieneTodosPorCondicion("links", {[campo_id]: id}, asoc);
			comp.prodAprobEnLink(links);

			// 2. Acciones si es una colección
			if (entidad == "colecciones") {
				// 2.1. Actualiza sus capítulos con el mismo status
				await baseDeDatos.actualizaTodosPorCondicion(
					"capitulos",
					{coleccion_id: id},
					{...datos, statusColeccion_id: statusFinal_id, statusSugeridoPor_id: usAutom_id}
				);

				// 2.2. Actualiza en los links de sus capítulos el campo 'prodAprob'
				baseDeDatos
					.obtieneTodosPorCondicion("capitulos", {coleccion_id: id})
					.then((n) => n.map((m) => m.id))
					.then((ids) =>
						baseDeDatos
							.obtieneTodosPorCondicion("links", {capitulo_id: ids}, "capitulo")
							.then((links) => comp.prodAprobEnLink(links))
					);
			}

			// 3. Si es un capítulo, actualiza el status de link de su colección
			if (entidad == "capitulos") comp.linksEnColec(original.coleccion_id);

			// 4. Actualiza los RCLV, en el campo 'prodsAprob'
			validacs.accionesPorCambioDeStatus(entidad, original);
		}

		// Fin
		const destino = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;
		return res.redirect(destino);
	},
	elimina_guardar: async (req, res) => {
		// Variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const original =
			entidad == "colecciones"
				? await baseDeDatos.obtienePorId("colecciones", id, "capitulos")
				: await baseDeDatos.obtienePorId(entidad, id);
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let espera = [];

		// Elimina sus archivos avatar y ediciones, y si es un producto, también sus links y capítulos
		espera.push(procesos.elimina.dependientes(entidad, id, original));

		// Acciones si es un RCLV
		if (familia == "rclv") {
			// Borra el vínculo en las ediciones de producto y las elimina si quedan vacías
			espera.push(procesos.elimina.vinculoEdicsProds({entidadRCLV: entidad, rclvID: id}));

			// Borra el vínculo en los productos y les cambia el status si corresponde
			espera.push(procesos.elimina.vinculoProds({entidadRCLV: entidad, rclvID: id}));

			// Borra el vínculo en los fechasDelAno
			if (entidad == "epocasDelAno")
				await baseDeDatos.actualizaTodosPorCondicion("fechasDelAno", {[campo_id]: id}, {[campo_id]: 1});
		}

		// Elimina el registro
		await Promise.all(espera);
		await baseDeDatos.eliminaPorId(entidad, id);

		// Elimina registros vinculados
		const tablas = ["histStatus", "histEdics", "misConsultas", "pppRegistros", "calRegistros"];
		for (let tabla of tablas) baseDeDatos.eliminaTodosPorCondicion(tabla, {entidad, entidad_id: id});

		// Actualiza solapamiento y la variable 'fechasDelAno'
		if (entidad == "epocasDelAno") comp.actualizaSolapam();

		// Guarda la información para la próxima vista durante 5 segundos
		const nombre = comp.nombresPosibles(original);
		let objeto = {entidad, nombre};
		if (origen) objeto.origen = origen;
		res.cookie("eliminado", objeto, {maxAge: 5000});

		// Fin
		return res.redirect("/" + familia + "/eliminado");
	},
	eliminado_form: (req, res) => {
		// Variables
		const {entidad, nombre, origen} = req.cookies && req.cookies.eliminado ? req.cookies.eliminado : {};
		if (!entidad) return res.redirect("/");
		else res.clearCookie("eliminado");

		// Más variables
		const articFinal = comp.obtieneDesdeEntidad.oa(entidad);
		const articInicial = articFinal == "a" ? "La " : "El ";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad).toLowerCase();
		const capitulos = entidad == "colecciones" ? "y sus capítulos, " : "";
		const plural1 = entidad == "colecciones" ? "ron" : "";
		const plural2 = entidad == "colecciones" ? "s" : "";
		const link = origen == "TM" ? "/revision/tablero-de-mantenimiento" : "/";
		const titulo = comp.letras.inicialMayus(entidadNombre) + " eliminad" + articFinal + plural2;

		// Cartel de registro eliminado
		const informacion = {
			mensajes: [
				articInicial +
					entidadNombre +
					' "' +
					nombre +
					'" ' +
					capitulos +
					"fue" +
					plural1 +
					" eliminad" +
					articFinal +
					plural2 +
					" de nuestra base de datos.",
			],
			iconos: [{nombre: "fa-thumbs-up", link, titulo: "Entendido"}],
			check: true,
		};

		// Fin
		return res.render("CMP-0Estructura", {informacion, titulo});
	},
};
let obtieneDatos = async (req) => {
	const {entidad, id, motivo_id} = {...req.query, ...req.body};
	const familia = comp.obtieneDesdeEntidad.familia(entidad);
	const {ruta} = comp.reqBasePathUrl(req);
	const codigo = ruta.slice(1, -1); // 'inactivar' o 'recuperar'
	const userID = req.session.usuario.id;
	const ahora = comp.fechaHora.ahora();
	const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
	const include = comp.obtieneTodosLosCamposInclude(entidad);
	const original = await baseDeDatos.obtienePorId(entidad, id, include);
	const statusFinal_id = codigo == "inactivar" ? inactivar_id : recuperar_id;

	// Fin
	return {entidad, id, familia, motivo_id, codigo, userID, ahora, campo_id, original, statusFinal_id};
};
