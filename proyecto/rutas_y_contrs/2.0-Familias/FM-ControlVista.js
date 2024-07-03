"use strict";
// Variables
const procesos = require("./FM-FN-Procesos");
const validacs = require("./FM-FN-Validar");

module.exports = {
	motivosForm: async (req, res) => {
		// Variables
		const datos = await procesos.obtieneDatosForm(req);

		// Obtiene datos para la vista
		const ayudasTitulo = "Por favor decinos por qué sugerís " + datos.codigo + " este registro.";
		const motivos = statusMotivos.filter((n) => n[datos.petitFamilias]);
		const entidades = variables.entidades[datos.petitFamilias];

		// Render del formulario
		return res.render("CMP-0Estructura", {...datos, ayudasTitulo, motivos, entidades});
	},
	historialForm: async (req, res) => {
		// Variables
		const datos = await procesos.obtieneDatosForm(req);

		// Obtiene datos para la vista
		const ayudasTitulo =
			datos.tema == "revisionEnts"
				? ["Para tomar una decisión contraria a la del usuario, necesitamos tu comentario para darle feedback."]
				: ["Por favor decinos por qué sugerís " + datos.codigo + " este registro."];
		const historialStatus = await procesos.historialDeStatus.obtiene({entidad: datos.entidad, ...datos.registro});

		// Render del formulario
		return res.render("CMP-0Estructura", {...datos, ayudasTitulo, historialStatus});
	},
	inacRecup_guardar: async (req, res) => {
		//  Variables
		let datos = await procesos.obtieneDatosGuardar(req);
		const {entidad, id, familia, motivo_id, codigo, userID, ahora, campo_id, original, statusFinal_id, comentario} = datos;

		// CONSECUENCIAS - Actualiza el status en el registro original
		datos = {
			statusSugeridoPor_id: userID,
			statusSugeridoEn: ahora,
			statusRegistro_id: statusFinal_id,
		};
		if (codigo == "inactivar") datos.motivo_id = motivo_id;
		await baseDeDatos.actualizaPorId(entidad, id, datos);

		// CONSECUENCIAS - Agrega un registro en el statusHistorial
		let datosHist = {
			...{entidad, entidad_id: id}, // entidad
			...{statusOriginalPor_id: original.statusSugeridoPor_id, statusFinalPor_id: userID}, // personas
			...{statusOriginal_id: original.statusRegistro_id, statusFinal_id}, // status
			...{statusOriginalEn: original.statusSugeridoEn}, // fecha
			comentario,
		};
		datosHist.motivo_id = codigo == "inactivar" ? motivo_id : original.motivo_id;
		baseDeDatos.agregaRegistro("statusHistorial", datosHist);

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
		const tablas = ["statusHistorial", "histEdics", "misConsultas", "pppRegistros", "calRegistros"];
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
	correcciones: {
		motivoForm: async (req, res) => {
			// Variables
			const tema = "correccion";
			const codigo = "cambiarMotivo";
			const titulo = "Cambiar el Motivo";
			const {entidad, id, origen} = req.query;
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

			// Obtiene los registros
			const {regEnt, ultHist} = await obtieneRegs({entidad, id});
			const motivo = ultHist && ultHist.motivo_id ? statusMotivos.find((n) => n.id == ultHist.motivo_id) : null;

			// Datos para la vista
			const motivos = statusMotivos.filter((n) => n[petitFamilias]);
			const entidades = variables.entidades[petitFamilias];
			const entsNombre = variables.entidades[petitFamilias + "Nombre"];
			const imgDerPers = procesos.obtieneAvatar(regEnt).orig;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);

			// Envía la info a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, origen},
				...{familia, entidad, id, registro: regEnt, motivo, ultHist, imgDerPers},
				...{entidades,entsNombre, motivos},
				cartelGenerico: true,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, respuesta} = req.query;

			// Obtiene los registros
			const {regEnt, ultHist} = await obtieneRegs({entidad, id});
			const {motivo: motivoReg} = regEnt;
			const motivoHist = ultHist.motivo_id ? statusMotivos.find((n) => n.id == ultHist.motivo_id) : null;

			// Acciones si se aprobó el motivo del regEnt
			if (respuesta == "registro") {
			}
			// Acciones si se aprobó el motivo del historial
			else if (respuesta == "historial") {
				const motivo_id = motivoHist.id;
				await baseDeDatos.actualizaPorId(entidad, id, {motivo_id});
			}

			// Fin
			return res.redirect("/revision/tablero-de-entidades");
		},
	},

};
let obtieneRegs = async ({entidad, id}) => {
	// Obtiene el motivo del producto
	let include = [];
	if (entidad == "capitulos") include.push("coleccion");
	if (entidad == "colecciones") include.push("capitulos");
	const regEnt = await baseDeDatos.obtienePorId(entidad, id, include);

	// Obtiene el motivo del historial
	const condicion = {
		entidad,
		entidad_id: id,
		[Op.or]: {statusOriginal_id: {[Op.gt]: aprobado_id}, statusFinal_id: {[Op.gt]: aprobado_id}},
	};

	const ultHist = await baseDeDatos.obtienePorCondicionElUltimo("statusHistorial", condicion, "statusFinalEn");

	// Fin
	return {regEnt, ultHist};
};
