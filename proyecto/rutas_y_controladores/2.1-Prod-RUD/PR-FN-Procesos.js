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
	obtieneLinksDelProducto: async ({entidad, id, statusLink_id, userID, autTablEnts}) => {
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
			// Los ordena por url
			links.sort((a, b) => (a.url < b.url ? -1 : 1));

			// Los ordena por calidad
			links.sort((a, b) => b.calidad - a.calidad);

			// Los ordena por partes
			links.sort((a, b) => a.parte - b.parte);

			// Los ordena por completo
			links.sort((a, b) => b.completo - a.completo);

			// Los ordena por idioma
			links.sort((a, b) => b.castellano - a.castellano);

			// Les asigna un color en función del idioma
			for (let link of links) link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";

			// Reemplaza los embeded
			for (let link of links) {
				const provEmbeded = provsEmbeded.find((n) => n.id == link.prov_id);
				if (provEmbeded) link.url = urlSitio + "/producto/visualizacion/link_id=" + link.id;
				else link.url = "//" + link.url;
			}

			// Los separa entre Películas y Trailers
			PL = links.filter((n) => n.tipo && n.tipo.pelicula);
			TR = links.filter((n) => n.tipo && n.tipo.trailer);
		}

		// Fin
		return {PL, TR};
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
			for (let campo in datos)
				datos[campo] =
					campo != "calificacion"
						? Math.round(califics.map((n) => n[campo].valor).reduce((acum, i) => acum + i) / califics.length)
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
		const interesDelUsuario = registro ? registro.detalle : sinPref;

		// Fin
		return interesDelUsuario;
	},
};
