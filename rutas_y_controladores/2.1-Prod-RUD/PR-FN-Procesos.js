"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	bloqueIzq: (producto) => {
		// Variables
		const paisesNombre = producto.paises_id ? comp.paises_idToNombre(producto.paises_id) : "";
		let infoGral = [];
		let actores = [];

		// Informacion General
		if (producto.categoria) infoGral.push({titulo: "Categoría", valor: producto.categoria.nombre});
		if (producto.publico) infoGral.push({titulo: "Público sugerido", valor: producto.publico.nombre});
		if (producto.castellano !== null)
			infoGral.push({titulo: "Tenemos links en castellano", valor: producto.castellano ? "SI" : "NO"});
		if (producto.tipo_actuacion) infoGral.push({titulo: "Tipo de actuación", valor: producto.tipo_actuacion.nombre});
		if (producto.ano_estreno) infoGral.push({titulo: "Año de estreno", valor: producto.ano_estreno});
		if (producto.cant_temps) {
			if (producto.ano_fin) infoGral.push({titulo: "Año de fin", valor: producto.ano_fin});
		} else if (producto.duracion) infoGral.push({titulo: "Duracion", valor: producto.duracion + " min."});
		if (producto.color !== null) infoGral.push({titulo: "Es a color", valor: producto.color ? "SI" : "NO"});
		if (paisesNombre) infoGral.push({titulo: "País" + (paisesNombre.includes(",") ? "es" : ""), valor: paisesNombre});
		if (producto.idioma_original) infoGral.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});
		if (producto.direccion) infoGral.push({titulo: "Dirección", valor: producto.direccion});
		if (producto.guion) infoGral.push({titulo: "Guión", valor: producto.guion});
		if (producto.musica) infoGral.push({titulo: "Música", valor: producto.musica});
		if (producto.produccion) infoGral.push({titulo: "Producción", valor: producto.produccion});

		// Actores
		if (producto.actores) actores = producto.actores;

		// Fin
		return {infoGral, actores};
	},
	obtieneLinksDelProducto: async (entidad, id, status_registro_id) => {
		// Variables
		const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		const include = ["tipo", "prov"];

		// Declara las variables de links de tipo 'Película' y 'Trailer'
		let PL = [];
		let TR = [];

		// Obtiene los links
		if (!status_registro_id) status_registro_id = aprobado_id;
		const links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[campo_id]: id, status_registro_id}, include);

		// Procesos si hay links
		if (links.length) {
			// 1. Los ordena
			// 1.A. Por calidad
			links.sort((a, b) => b.calidad - a.calidad);
			// 1.B. Por completo
			links.sort((a, b) => b.completo - a.completo);
			// 1.C. Por idioma
			links.sort((a, b) => b.castellano - a.castellano);

			// 2. Les asigna un color en función del idioma
			links.map((link) => {
				link.color = link.castellano ? "verde" : link.subtitulos ? "amarillo" : "rojo";
			});

			// 3. Los separa entre Películas y Trailers
			PL = links.filter((n) => n.tipo && n.tipo.pelicula);
			TR = links.filter((n) => n.tipo && n.tipo.trailer);
		}

		// Fin
		return {PL, TR};
	},
};
