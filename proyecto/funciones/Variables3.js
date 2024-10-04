"use strict";

module.exports = {
	lecturasDeBd: async () => {
		// Variables
		const respuesta = {};

		// Obtiene las lecturas de BD
		const lecturas = {
			// Variables de usuario
			statusRegistrosUs: baseDeDatos.obtieneTodosConOrden("statusRegistrosUs", "orden"),
			rolesUs: baseDeDatos.obtieneTodosConOrden("rolesUsuarios", "orden"),

			// Variable de entidades
			statusRegistros: baseDeDatos.obtieneTodosConOrden("statusRegistros", "orden"),
			generos: baseDeDatos.obtieneTodosConOrden("generos", "orden"),
			statusMotivos: baseDeDatos
				.obtieneTodosConOrden("statusMotivos", "orden")
				.then((n) => n.sort((a, b) => (a.grupo < b.grupo ? -1 : a.grupo > b.grupo ? 1 : 0))),
			motivosEdics: baseDeDatos.obtieneTodosConOrden("motivosEdics", "orden"),

			// Variables de productos
			idiomas: baseDeDatos.obtieneTodosConOrden("idiomas", "nombre"),
			paises: baseDeDatos.obtieneTodos("paises", "cantProds").then((n) => n.sort((a, b) => (a.nombre < b.nombre ? -1 : 1))),
			publicos: baseDeDatos.obtieneTodosConOrden("publicos", "orden"),
			tiposActuacion: baseDeDatos.obtieneTodosConOrden("tiposActuacion", "orden"),
			epocasEstreno: baseDeDatos.obtieneTodosConOrden("epocasEstreno", "hasta", "DESC"),

			// Calificación de productos
			calCriterios: baseDeDatos.obtieneTodos("calCriterios"),
			feValores: baseDeDatos.obtieneTodosConOrden("feValores", "orden"),
			entretiene: baseDeDatos.obtieneTodosConOrden("entretiene", "orden"),
			calidadTecnica: baseDeDatos.obtieneTodosConOrden("calidadTecnica", "orden"),

			// Variables de RCLVs
			epocasOcurrencia: baseDeDatos.obtieneTodosConOrden("epocasOcurrencia", "orden"),
			rolesIglesia: baseDeDatos.obtieneTodosConOrden("rolesIglesia", "orden"),
			canons: baseDeDatos.obtieneTodosConOrden("canons", "orden"),
			hoyEstamos: baseDeDatos.obtieneTodosConOrden("hoyEstamos", "nombre"),

			// Variables de links
			linksProvs: baseDeDatos
				.obtieneTodos("linksProvs", "cantLinks")
				.then((n) => n.sort((a, b) => b.cantLinks.cantidad - a.cantLinks.cantidad)),
			linksTipos: baseDeDatos.obtieneTodos("linksTipos"),

			// Consultas
			cnEntidades: baseDeDatos.obtieneTodos("cnEntidades"),
			cnLayouts: baseDeDatos
				.obtieneTodos("cnLayouts", "entidades")
				.then((n) => n.filter((m) => m.activo))
				.then((n) => n.sort((a, b) => a.orden - b.orden)),
			pppOpcsArray: baseDeDatos.obtieneTodos("pppOpciones"),

			// Menús
			menuCapacitac: baseDeDatos.obtieneTodosConOrden("menuCapacitac", "orden").then((n) => n.filter((m) => m.actualizado)),
			menuUsuario: baseDeDatos.obtieneTodosConOrden("menuUsuario", "orden").then((n) => n.filter((m) => m.actualizado)),

			// Otros
			meses: baseDeDatos.obtieneTodos("meses"),
			fechasDelAno: baseDeDatos.obtieneTodos("fechasDelAno", "epocaDelAno"),
			novedadesELC: baseDeDatos.obtieneTodosConOrden("novedadesELC", "fecha"),
		};
		const valores = await Promise.all(Object.values(lecturas));
		Object.keys(lecturas).forEach((campo, i) => (respuesta[campo] = valores[i]));

		// Fin
		return respuesta;
	},
	datosPartics: () => {
		// Variables
		const respuesta = {
			// 1. Status de productos - Simples
			creado_id: statusRegistros.find((n) => n.codigo == "creado").id,
			creadoAprob_id: statusRegistros.find((n) => n.codigo == "creadoAprob").id,
			aprobado_id: statusRegistros.find((n) => n.codigo == "aprobado").id,
			inactivar_id: statusRegistros.find((n) => n.codigo == "inactivar").id,
			recuperar_id: statusRegistros.find((n) => n.codigo == "recuperar").id,
			inactivo_id: statusRegistros.find((n) => n.codigo == "inactivo").id,

			// 2. Tipos de actuación
			anime_id: tiposActuacion.find((n) => n.codigo == "anime").id,
			documental_id: tiposActuacion.find((n) => n.codigo == "documental").id,
			actuada_id: tiposActuacion.find((n) => n.codigo == "actuada").id,

			// 3.A. Roles de usuario
			rolConsultas_id: rolesUs.find((n) => n.codigo == "consultas").id,
			rolPermInputs_id: rolesUs.find((n) => n.codigo == "permInputs").id,
			rolOmnipotente_id: rolesUs.find((n) => n.codigo == "omnipotente").id,
			rolesRevPERL_ids: rolesUs.filter((n) => n.revisorPERL).map((n) => n.id),
			rolesRevLinks_ids: rolesUs.filter((n) => n.revisorLinks).map((n) => n.id),

			// 3.B. Status de usuario
			mailPendValidar_id: statusRegistrosUs.find((n) => n.codigo == "mailPendValidar").id,
			mailValidado_id: statusRegistrosUs.find((n) => n.codigo == "mailValidado").id,
			editables_id: statusRegistrosUs.find((n) => n.codigo == "editables").id,
			perennes_id: statusRegistrosUs.find((n) => n.codigo == "perennes").id,

			// 4. Públicos
			mayores_ids: publicos.filter((n) => n.mayores).map((n) => n.id),
			familia_ids: publicos.find((n) => n.familia).id,
			menores_ids: publicos.filter((n) => n.menores).map((n) => n.id),

			// Otros - Productos
			atributosCalific: {feValores, entretiene, calidadTecnica},
			pppOpcsSimples: pppOpcsArray.filter((n) => !n.combo),
			hablaHispana: paises.filter((n) => n.idioma_id == "ES"),
			hablaNoHispana: paises.filter((n) => n.idioma_id != "ES"),

			// Links
			linkPelicula_id: linksTipos.find((n) => n.pelicula).id,
			linkTrailer_id: linksTipos.find((n) => n.trailer).id,
			provsEmbeded: linksProvs.filter((n) => n.embededPoner),

			// Otros
			epocasVarias: epocasOcurrencia.find((n) => n.id == "var"),
			epocasSinVarias: epocasOcurrencia.filter((n) => n.id != "var"),
			mesesAbrev: meses.map((n) => n.abrev),
			motivoInfoErronea: motivosEdics.find((n) => n.codigo == "infoErronea"),
			motivoVersionActual: motivosEdics.find((n) => n.codigo == "versionActual"),
			motivoDupl_id: statusMotivos.find((n) => n.codigo == "duplicado").id,
		};

		// Preferencias por producto
		respuesta.pppOpcsObj = {};
		for (let pppOcion of pppOpcsArray)
			respuesta.pppOpcsObj[pppOcion.codigo] = pppOpcsArray.find((n) => n.codigo == pppOcion.codigo);

		// Status de productos - Combinados
		respuesta.creados_ids = [respuesta.creado_id, respuesta.creadoAprob_id];
		respuesta.aprobados_ids = [respuesta.creadoAprob_id, respuesta.aprobado_id];
		respuesta.estables_ids = [respuesta.aprobado_id, respuesta.inactivo_id];
		respuesta.inacRecup_ids = [respuesta.inactivar_id, respuesta.recuperar_id];
		respuesta.activos_ids = [respuesta.creado_id, respuesta.creadoAprob_id, respuesta.aprobado_id];
		respuesta.inactivos_ids = [respuesta.inactivar_id, respuesta.inactivo_id];

		// Fin
		return respuesta
	},
};
