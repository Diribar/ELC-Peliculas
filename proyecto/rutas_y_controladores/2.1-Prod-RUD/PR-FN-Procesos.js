"use strict";

module.exports = {
	// Producto
	bloqueIzq: (producto) => {
		// Variables
		const paisesNombre = producto.paises_id ? comp.paises_idToNombre(producto.paises_id) : "";
		let infoGral = [];
		let actores = [];

		// Informacion General
		if (producto.cfc !== null) infoGral.push({titulo: "Relacionada con la Fe Católica", valor: producto.cfc ? "SI" : "NO"});
		if (producto.bhr !== null) infoGral.push({titulo: "Basada en Hechos Reales", valor: producto.bhr ? "SI" : "NO"});
		if (producto.publico) infoGral.push({titulo: "Público sugerido", valor: producto.publico.nombre});
		if (producto.duracion) infoGral.push({titulo: "Duracion", valor: producto.duracion + " min."});
		if (producto.anoEstreno) infoGral.push({titulo: "Año de estreno", valor: producto.anoEstreno});
		if (producto.tipoActuacion) infoGral.push({titulo: "Tipo de actuación", valor: producto.tipoActuacion.nombre});
		if (producto.cantTemps) {
			if (producto.anoFin) infoGral.push({titulo: "Año de fin", valor: producto.anoFin});
		}
		if (producto.color !== null) infoGral.push({titulo: "Es a color", valor: producto.color ? "SI" : "NO"});
		if (producto.musical !== null) infoGral.push({titulo: "Es un musical", valor: producto.musical ? "SI" : "NO"});
		infoGral.push({
			titulo: "País" + (paisesNombre && paisesNombre.includes(",") ? "es" : ""),
			valor: paisesNombre ? paisesNombre : "desconocido",
		});
		if (producto.idioma_original) infoGral.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});
		if (producto.direccion) infoGral.push({titulo: "Dirección", valor: producto.direccion});
		if (producto.guion) infoGral.push({titulo: "Guión", valor: producto.guion});
		if (producto.musica) infoGral.push({titulo: "Música", valor: producto.musica});
		if (producto.produccion) infoGral.push({titulo: "Producción", valor: producto.produccion});
		if (producto.epocaOcurrencia_id)
			infoGral.push({titulo: "Época respecto a Cristo", valor: producto.epocaOcurrencia.nombre});

		// Actores
		if (producto.actores) actores = producto.actores;

		// Fin
		return {infoGral, actores};
	},
	obtieneLinksDelProducto: async ({entidad, id, statusLink_id, userID, autTablEnts, origen}) => {
		// Variables
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const include = ["tipo", "prov"];

		// Declara las variables de links de tipo 'Película' y 'Trailer'
		let PL = [];
		let TR = [];

		// Obtiene los links
		const condiciones = statusLink_id
			? {statusRegistro_id: statusLink_id}
			: {
					[Op.or]: [
						{statusRegistro_id: aprobados_ids},
						autTablEnts
							? {statusRegistro_id: creado_id}
							: {[Op.and]: [{statusRegistro_id: creado_id}, {creadoPor_id: userID}]},
					],
			  };
		const links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: id, ...condiciones}, include);

		// Procesos si hay links
		if (links.length) {
			// Los ordena
			//links.sort((a, b) => (a.url < b.url ? -1 : 1)); // por url
			//links.sort((a, b) => b.calidad - a.calidad); // por calidad
			links.sort((a, b) => a.parte - b.parte); // por partes
			links.sort((a, b) => b.completo - a.completo); // por completo
			links.sort((a, b) => b.castellano - a.castellano); // por idioma

			// Les asigna un color en función del idioma
			for (let link of links) link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";

			// Asigna los url de visualización
			for (let link of links)
				link.href = link.prov.embededPoner
					? urlHost + "/links/visualizacion/?link_id=" + link.id + (origen ? "&origen=" + origen : "")
					: "//" + link.url;

			// Los separa entre Películas y Trailers
			PL = links.filter((n) => n.tipo && n.tipo.pelicula);
			TR = links.filter((n) => n.tipo && n.tipo.trailer);
		}

		TR = FN.trailer(TR);
		const GR = FN.gratis(PL);
		const CC = FN.conCosto(PL);

		// Fin
		return {GR, CC, TR};
	},
	actualizaCalifProd: async ({entidad, entidad_id}) => {
		// Variables
		let datos = {feValores: null, entretiene: null, calidadTecnica: null, calificacion: null};

		// Obtiene las calificaciones
		const condics = {entidad, entidad_id};
		const include = ["feValores", "entretiene", "calidadTecnica"];
		const califics = await BD_genericas.obtieneTodosPorCondicionConInclude("calRegistros", condics, include);

		// Si existen calificaciones, obtiene los promedios
		if (califics.length)
			for (let prop in datos)
				datos[prop] =
					prop != "calificacion"
						? Math.round(califics.map((n) => n[prop].valor).reduce((acum, i) => acum + i) / califics.length)
						: Math.round(califics.map((n) => n.resultado).reduce((acum, i) => acum + i) / califics.length);

		// Actualiza la calificación en el producto
		await BD_genericas.actualizaPorId(entidad, entidad_id, datos);

		// Fin
		return;
	},
	obtieneInteresDelUsuario: async ({usuario_id, entidad, entidad_id}) => {
		// Variables
		const condics = {usuario_id, entidad, entidad_id};
		const include = "detalle";

		// Obtiene el interés del usuario
		const registro = await BD_genericas.obtienePorCondicionConInclude("pppRegistros", condics, include);
		const interesDelUsuario = registro ? registro.detalle : pppOpcsObj.sinPref;

		// Fin
		return interesDelUsuario;
	},
};
let FN = {
	trailer: (links) => {
		// Array vacía
		if (!links.length) return [];

		// Array con valores
		let trailers = [];
		links.forEach((link, i) =>
			trailers.push({
				url: link.href,
				leyenda: "Trailer " + (i + 1),
				titulo: "Ver trailer",
				idioma: link.idioma,
			})
		);

		// Fin
		return trailers;
	},
	gratis: function (links) {
		// Array vacía
		if (!links.length) return [];
		let gratuitos = links.filter((n) => n.gratuito);
		if (!gratuitos.length) return [];

		// Variables
		let hayPartes, difsEnIdioma;

		// Selecciona los de mejor calidad
		gratuitos = this.dejaLaMejorCalidad(gratuitos);

		// Averigua si algunos son completos y otros son partes
		const partes = gratuitos.filter((n) => n.parte && n.parte != "-");
		if (partes.length) hayPartes = true;

		// Si no hay hayPartes, averigua si hay diferencias en el idioma
		if (!hayPartes) {
			const castellano = gratuitos.filter((n) => n.castellano);
			const subTits = gratuitos.filter((n) => n.subtitulos);
			const otroIdioma = gratuitos.filter((n) => !n.castellano && !n.subtitulos);
			if ((castellano.length && (subTits.length || otroIdioma.length)) || (subTits.length && otroIdioma.length))
				difsEnIdioma = true;
		}

		// Leyenda para diferenciarlos en la vista
		for (let link of gratuitos)
			link.leyenda = hayPartes
				? link.completo
					? "Completo"
					: "Parte " + link.parte
				: difsEnIdioma
				? link.castellano
					? "En castellano"
					: link.subtitulos
					? "Con subtit."
					: "En otro idioma"
				: "Ver gratis";

		// Deja la info indispensable
		gratuitos = gratuitos.map((link) => ({
			url: link.href,
			leyenda: link.leyenda,
			titulo: "Ver gratis",
			idioma: link.idioma,
		}));

		// Fin
		return gratuitos;
	},
	dejaLaMejorCalidad: (links) => {
		// Si no hay que desempatar, interrumpe la función
		if (links.length < 2) return links;

		// Rutina para dejar los links de mejor calidad
		for (let i = links.length - 1; i >= 0; i--) {
			// Variables
			const link = links[i];
			const {castellano, subtitulos, completo, parte} = link;

			// Obtiene los similares
			const linksSimilares = links.filter(
				(n) => n.castellano == castellano && n.subtitulos == subtitulos && n.completo == completo && n.parte == parte
			);

			// Quita los similares
			if (linksSimilares.length > 1) {
				const maxCalidad = Math.max(...linksSimilares.map((n) => n.calidad));
				const id = linksSimilares.find((n) => n.calidad == maxCalidad).id;
				for (let linkSimilar of linksSimilares)
					if (linkSimilar.id != id) {
						links = links.filter((n) => n.id != linkSimilar.id);
						i--;
					}
			}
		}

		// Fin
		return links;
	},
	conCosto: (links) => {
		// Array vacía
		if (!links.length) return [];
		let conCosto = links.filter((n) => !n.gratuito);
		if (!conCosto.length) return [];

		// Leyenda para diferenciarlos en la vista
		for (let link of conCosto) link.leyenda = link.prov.nombre;

		// Deja la info indispensable
		conCosto = conCosto.map((link) => ({url: link.href, leyenda: link.leyenda, titulo: "Ver c/costo", idioma: link.idioma}));

		// Fin
		return conCosto;
	},
};
