"use strict";

module.exports = {
	obtieneProds: async (usuario_id) => {
		// Variables
		const entidades = variables.entidades.prods;
		const camposFijos = {entidades, usuario_id};
		let campos;

		// Productos Inactivos
		campos = {...camposFijos, status_id: inactivo_id};
		let inactivos = FN_tablManten.obtieneRegs(campos);

		// Productos Aprobados
		campos = {...camposFijos, status_id: aprobado_id};
		let prodsAprob = FN_tablManten.obtieneRegs(campos);

		// Productos Sin Edición (en status creadoAprob)
		let SE_pel = FN_tablManten.obtieneSinEdicion("peliculas");
		let SE_col = FN_tablManten.obtieneSinEdicion("colecciones");
		let SE_cap = FN_tablManten.obtieneSinEdicion("capitulos");

		// Calificaciones de productos y Preferencia por productos
		let cal = baseDeDatos.obtieneTodosPorCondicion("calRegistros", {usuario_id: usuario_id});
		let ppp = baseDeDatos.obtieneTodosPorCondicion("pppRegistros", {
			usuario_id: usuario_id,
			ppp_id: pppOpcsObj.yaLaVi.id,
		});

		// Espera las lecturas
		[inactivos, prodsAprob, SE_pel, SE_col, SE_cap, cal, ppp] = await Promise.all([
			inactivos,
			prodsAprob,
			SE_pel,
			SE_col,
			SE_cap,
			cal,
			ppp,
		]);
		const pelisColes = prodsAprob.filter((m) => m.entidad != "capitulos");
		const pppSinCal = ppp.filter((n) => !cal.some((m) => m.entidad == n.entidad && m.entidad_id == n.entidad_id));

		// Resultados
		let resultados = {
			// Productos
			SE: [...SE_pel, ...SE_col, ...SE_cap], // sin edición
			IN: inactivos.filter((n) => !n.statusColeccion_id || n.statusColeccion_id == aprobado_id), // películas y colecciones inactivas, y capítulos con su colección aprobada
			SC: pelisColes.filter((n) => pppSinCal.find((m) => m.entidad == n.entidad && m.entidad_id == n.id)), // prodsAprob - Sin calificar
			ST: pelisColes.filter((n) => n.tema_id == 1), // prodsAprob - Sin tema

			// Prods - sin links
			SL_pelis: pelisColes.filter((n) => !n.linksGral && n.entidad == "peliculas"), // películas
			SL_coles: pelisColes.filter((n) => !n.linksGral && n.entidad == "colecciones"), // colecciones

			// Tiene links, pero no variantes básicas
			SLG_basico: pelisColes.filter((n) => n.linksGral && !n.linksGratis), // sin links gratuitos
			SLC_basico: pelisColes.filter((n) => n.linksGral && !n.linksCast && !n.linksSubt), // sin links en castellano

			// Links HD
			SL_HD_pelis: pelisColes.filter((n) => n.linksGral && !n.HD_Gral && n.entidad == "peliculas"), // con Links pero sin HD
			SL_HD_coles: pelisColes.filter((n) => n.linksGral && !n.HD_Gral && n.entidad == "colecciones"), // con Links pero sin HD
			SLG_HD: pelisColes.filter((n) => n.HD_Gral && n.linksGratis && !n.HD_Gratis), // sin HD gratuitos
			SLC_HD: pelisColes.filter((n) => n.HD_Gral && (n.linksCast || n.linksSubt) && !n.HD_Cast && !n.HD_Subt), // sin HD en castellano
		};

		// Fin
		return resultados;
	},
	obtieneRCLVs: async (usuario_id) => {
		// Variables
		const entidades = variables.entidades.rclvs;
		const camposFijos = {entidades, usuario_id};
		const include = [...variables.entidades.prods, "prodsEdiciones", "fechaDelAno"];
		let campos;

		// Inactivos
		campos = {...camposFijos, status_id: inactivo_id};
		let IN = FN_tablManten.obtieneRegs(campos);

		// Aprobados
		campos = {...camposFijos, status_id: aprobado_id};
		let rclvsAprob = FN_tablManten.obtieneRegs({...campos, include});

		// Await
		[IN, rclvsAprob] = await Promise.all([IN, rclvsAprob]);

		// Sin Avatar
		const SA = rclvsAprob.filter((m) => !m.avatar && m.id > 10);

		// Con solapamiento de fechas
		const SF = rclvsAprob.filter((m) => m.solapam_fechas);

		// Sin producto
		const SP = rclvsAprob.filter(
			(m) => !m.peliculas.length && !m.colecciones.length && !m.capitulos.length && !m.prodsEdiciones.length
		);

		// Fin
		return {IN, SA, SF, SP};
	},
	obtieneLinksInactivos: async (usuario_id) => {
		// Variables
		let include = variables.entidades.asocProds;
		let condicion = {statusRegistro_id: inactivo_id};

		// Obtiene los links 'a revisar'
		let linksInactivos = await baseDeDatos.obtieneTodosPorCondicion("links", condicion, include);

		// Obtiene los productos
		let productos = linksInactivos.length ? await FN_tablManten.obtieneProdsDeLinks(linksInactivos, usuario_id) : {LI: []};

		// Fin
		return productos;
	},
	urlsOrigenDestino: (entidad) => {
		const siglaFam = comp.obtieneDesdeEntidad.siglaFam(entidad);
		return [
			// Productos y Rclvs
			{codOrigen: "DT", destino: "/" + entidad + "/detalle/" + siglaFam, cola: true}, // OK
			{codOrigen: "RA", destino: "/revision/alta/" + siglaFam + "/" + entidad, cola: true},

			// Productos
			{codOrigen: "PDA", destino: "/" + entidad + "/agregar-da"}, // OK
			{codOrigen: "PED", destino: "/" + entidad + "/edicion/p", cola: true},
			{codOrigen: "RL", destino: "/revision/abm-links/p/" + entidad, cola: true},

			// Tableros
			{codOrigen: "TE", destino: "/revision/tablero"},
			{codOrigen: "TM", destino: "/tablero-de-mantenimiento"},
			{codOrigen: "TU", destino: "/revision/tablero-de-usuarios"},
		];
	},
	obtieneRuta: (entidad, originalUrl) => {
		// Variables
		const familia = comp.obtieneDesdeEntidad.familia(entidad);
		const siglaFam = comp.obtieneDesdeEntidad.siglaFam(entidad);

		// Producto Agregar
		if (originalUrl.startsWith("/producto/agregar")) {
			const rutas = [
				{ant: "/palabras-clave", act: "pc"},
				{ant: "/desambiguar", act: "ds"},
				{ant: "/datos-duros", act: "dd"},
				{ant: "/datos-adicionales", act: "da"},
				{ant: "/confirma", act: "cn"},
				{ant: "/terminaste", act: "tr"},
				{ant: "/ingreso-manual", act: "im"},
				{ant: "/ingreso-fa", act: "fa"},
			];
			const ruta = rutas.find((n) => originalUrl.endsWith(n.ant));
			return ruta ? {ant: "/producto/agregar/" + ruta.ant, act: "/producto/agregar-" + ruta.act} : null;
		}

		// Rutas de Familia, Producto RUD y Rclv CRUD
		if (["/producto", "/rclv"].some((n) => originalUrl.startsWith(n))) {
			// Obtiene las rutas
			const rutas = [
				// Familia
				{ant: "/" + familia + "/historial", act: "/" + entidad + "/historial"},
				{ant: "/" + familia + "/inactivar", act: "/" + entidad + "/inactivar"},
				{ant: "/" + familia + "/recuperar", act: "/" + entidad + "/recuperar"},
				{ant: "/" + familia + "/eliminadoPorCreador", act: "/" + entidad + "/eliminado-por-creador"},
				{ant: "/" + familia + "/eliminar", act: "/" + entidad + "/eliminado"},

				// RUD Producto y Rclv
				{ant: "/" + familia + "/detalle", act: "/" + entidad + "/detalle/" + siglaFam},
				{ant: "/" + familia + "/edicion", act: "/" + entidad + "/edicion/" + siglaFam},
			];
			if (familia == "producto")
				rutas.push(
					{ant: "/producto/calificar", act: "/" + entidad + "/calificar/p"},
					{ant: "/links/abm", act: "/" + entidad + "/abm-links/p"}
				);
			if (familia == "rclv") rutas.push({ant: "/rclv/agregar", act: "/" + entidad + "/agregar/r"});

			// Redirecciona
			const ruta = rutas.find((n) => originalUrl.startsWith(n.ant));
			return ruta;
		}

		// Links
		if (familia == "link") return {ant: "/links/visualizacion/", act: "/links/mirar/l"};

		// Revisión de Entidades
		if (originalUrl.startsWith("/revision")) {
			// Rutas específicas de cada familia
			const rutas = [
				{ant: "/revision/" + familia + "/alta", act: "/revision/alta/" + siglaFam + "/" + entidad},
				{ant: "/revision/solapamiento/", act: "/revision/solapamiento/r/" + entidad},
				{ant: "/revision/links", act: "/revision/abm-links/p/" + entidad},
			];

			// Rutas compartidas
			tareas = ["edicion", "rechazar", "inactivar", "recuperar"];
			for (let tarea of tareas)
				rutas.push({ant: "/revision/" + familia + "/" + tarea, act: "/revision/" + tarea + "/" + entidad});

			// Redirecciona
			const ruta = rutas.find((n) => originalUrl.startsWith(n.ant));
			return ruta;
		}

		// Fin
		return null;
	},
};

let FN_tablManten = {
	obtieneRegs: async function (campos) {
		// Variables
		const {entidades} = campos;
		campos.include ? campos.include.push("ediciones") : (campos.include = ["ediciones"]);
		let resultados = [];

		// Obtiene los resultados
		for (let entidad of entidades) resultados.push(this.lecturaBD({entidad, ...campos}));

		// Consolida los resultados y los ordena
		resultados = await Promise.all(resultados)
			.then((n) => n.flat())
			.then((n) => n.sort((a, b) => b.statusSugeridoEn - a.statusSugeridoEn));

		// Quita los comprometidos por capturas
		resultados = await comp.sinProblemasDeCaptura(resultados, campos.usuario_id);

		// Fin
		return resultados;
	},
	lecturaBD: async ({status_id, include, entidad}) => {
		// Variables
		let includeBD = [...include];
		if (entidad == "colecciones") includeBD.push("csl");

		// Condiciones
		let condicion = {statusRegistro_id: status_id}; // Con status según parámetro
		if (variables.entidades.rclvs.includes(entidad)) condicion.id = {[Op.gt]: idMinRclv}; // Excluye los registros RCLV cuyo ID es <= idMinRclv

		// Resultado
		const resultados = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion, includeBD).then((n) =>
			n.map((m) => {
				let edicion = m.ediciones.find((m) => m.editadoPor_id == condicion.usuario_id);
				delete m.ediciones;
				if (edicion) {
					edicion = purgaEdicion(edicion, entidad);
					m = {...m, ...edicion}; // Actualiza el original con la edición
				}
				return {...m, entidad};
			})
		);

		// Fin
		return resultados;
	},
	obtieneSinEdicion: (entidad) => {
		// Variables
		const condicion = {statusRegistro_id: creadoAprob_id};
		if (entidad == "capitulos") condicion.statusColeccion_id = aprobado_id;

		// Obtiene la información
		return baseDeDatos
			.obtieneTodosPorCondicion(entidad, condicion, "ediciones")
			.then((n) => n.filter((m) => !m.ediciones.length))
			.then((n) => n.map((m) => ({...m, entidad})));
	},
	obtieneProdsDeLinks: async (links, usuario_id) => {
		// Variables
		let LI = [];

		// Obtiene los prods
		for (let link of links) {
			// Variables
			const entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
			const asociacion = comp.obtieneDesdeEntidad.asociacion(entidad);
			const fechaRef = link.statusSugeridoEn;
			const fechaRefTexto = comp.fechaHora.diaMes(link.statusSugeridoEn);

			// Agrega los registros
			LI.push({...link[asociacion], entidad, fechaRef, fechaRefTexto});
		}

		if (LI.length > 1) {
			// Ordena
			LI.sort((a, b) => new Date(b.fechaRef) - new Date(a.fechaRef)); // Fecha más reciente

			// Elimina repetidos
			LI = comp.eliminaRepetidos(LI);
		}

		// Deja solamente los prods aprobados
		if (LI.length) LI = LI.filter((n) => aprobados_ids.includes(n.statusRegistro_id));

		// Deja solamente los prods sin problemas de captura
		if (LI.length) LI = await comp.sinProblemasDeCaptura(LI, usuario_id);

		// Fin
		return {LI};
	},
};
