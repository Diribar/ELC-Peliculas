"use strict";
// Variables
const procesos = require("./FM-FN-Procesos");
const procsRT = require("../../funciones/1-Rutinas/RT-Procesos");
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
		const {statusAlineado, prodRclv} = req.body;
		const datos = await procesos.obtieneDatosForm(req);

		// Obtiene datos para la vista
		const ayudasTitulo =
			datos.codigo == "historial"
				? false
				: datos.tema == "revisionEnts"
				? ["Para tomar una decisión contraria a la del usuario, necesitamos tu comentario para darle feedback."]
				: ["Por favor decinos por qué sugerís " + datos.codigo + " este registro."];
		const historialStatus = await procesos.historialDeStatus.obtiene({entidad: datos.entidad, ...datos.registro});
		const {usuario} = req.session;
		const revisorPERL = usuario && usuario.rolUsuario.revisorPERL;

		// Render del formulario
		return res.render("CMP-0Estructura", {...datos, ayudasTitulo, historialStatus, statusAlineado, revisorPERL, prodRclv});
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
		else if ((codigo = "recuperar")) {
			const ultHist = await procesos.obtieneUltHist(entidad, id);
			if (ultHist) datos.motivo_id = ultHist.motivo_id;
		}
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
	correcs: {
		motivoForm: async (req, res) => {
			// Variables
			const tema = "correccion";
			const codigo = "cambiarMotivo";
			const titulo = "Cambiar el Motivo";
			const {entidad, id, origen, prodRclv, ultHist} = {...req.query, ...req.body};
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

			// Datos para la vista
			const motivo = ultHist.motivo_id ? statusMotivos.find((n) => n.id == ultHist.motivo_id) : null;
			const motivos = statusMotivos.filter((n) => n[petitFamilias]);
			const entidades = variables.entidades[petitFamilias];
			const entsNombre = variables.entidades[petitFamilias + "Nombre"];
			const imgDerPers = procesos.obtieneAvatar(prodRclv).orig;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);

			// Envía la info a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, origen},
				...{familia, entidad, id, registro: prodRclv, motivo, ultHist, imgDerPers},
				...{entidades, entsNombre, motivos},
				cartelGenerico: true,
			});
		},
		motivoGuardar: async (req, res) => {
			// Variables
			const {entidad, id, motivo_id, ultHist, comentario} = {...req.query, ...req.body};
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const cola = "/?entidad=" + entidad + "&id=" + id;

			// Actualiza el motivo en el último registro del historial
			await baseDeDatos.actualizaPorId("statusHistorial", ultHist.id, {motivo_id, comentario});

			// Fin
			return res.redirect("/" + familia + "/historial" + cola);
		},
		statusForm: async (req, res) => {
			// Variables
			const tema = "correccion";
			const codigo = "corregirStatus";
			const titulo = "Corregir el Status";
			const {entidad, id, origen, prodRclv} = {...req.query, ...req.body};

			// Obtiene el historial
			const historialStatus = await procesos.historialDeStatus.obtiene({entidad, ...prodRclv});

			// Datos para la vista
			const imgDerPers = procesos.obtieneAvatar(prodRclv).orig;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);

			// Fin
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, origen},
				...{entidad, id, registro: prodRclv, imgDerPers},
				...{historialStatus, familia},
				cartelGenerico: true,
			});
		},
		statusGuardar: async (req, res) => {
			// Variables
			const {entidad, id, origen, opcion, prodRclv, ultHist} = {...req.query, ...req.body};
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const cola = "/?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "");
			let destino;

			// Acciones si se aprueba el status del producto
			if (opcion == "prodRclv") {
				await baseDeDatos.eliminaTodosPorCondicion("statusHistorial", {entidad, entidad_id: id}); // elimina el historial de ese 'prodRclv'
				if (prodRclv.statusRegistro_id > aprobado_id) destino = "inactivar"; // establece que se redireccione a 'inactivar'
			}

			// Acciones si se aprueba el status del historial
			if (opcion == "historial") {
				const datos = {statusRegistro_id: ultHist.statusFinal_id, statusSugeridoEn: ultHist.statusFinalEn};
				await baseDeDatos.actualizaPorId(entidad, id, datos);
				destino = "detalle";
			}

			// En ambos casos, se actualiza la tabla de 'statusErrores'
			procsRT.revisaStatus.consolidado(); // no hace falta el 'await'

			// Fin
			return res.redirect("/" + familia + "/" + destino + cola);
		},
	},
};
