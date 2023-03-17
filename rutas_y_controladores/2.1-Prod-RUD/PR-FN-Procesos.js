"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	bloqueIzq: (producto) => {
		// Variables
		const paisesNombre = producto.paises_id ? comp.paises_idToNombre(producto.paises_id) : "";
		let [bloque1, bloque2, bloque3] = [[], [], []];

		// Bloque1
		if (producto.categoria) bloque1.push({titulo: "Categoría", valor: producto.categoria.nombre});
		if (producto.publico) bloque1.push({titulo: "Público Sugerido", valor: producto.publico.nombre});
		if (producto.en_castellano !== null) bloque1.push({titulo: "En castellano", valor: producto.en_castellano ? "SI" : "NO"});
		if (producto.tipo_actuacion) bloque1.push({titulo: "Tipo de Actuación", valor: producto.tipo_actuacion.nombre});
		if (producto.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: producto.ano_estreno});
		if (producto.cant_temps) {
			if (producto.ano_fin) bloque1.push({titulo: "Año de fin", valor: producto.ano_fin});
		} else if (producto.duracion) bloque1.push({titulo: "Duracion", valor: producto.duracion});
		if (producto.en_color !== null) bloque1.push({titulo: "Es a color", valor: producto.en_color ? "SI" : "NO"});
		// Menor importancia
		if (paisesNombre) bloque1.push({titulo: "País" + (paisesNombre.includes(",") ? "es" : ""), valor: paisesNombre});
		if (producto.idioma_original) bloque1.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});

		// Bloque2
		if (producto.direccion) bloque2.push({titulo: "Dirección", valor: producto.direccion});
		if (producto.guion) bloque2.push({titulo: "Guión", valor: producto.guion});
		if (producto.musica) bloque2.push({titulo: "Música", valor: producto.musica});
		if (producto.produccion) bloque2.push({titulo: "Producción", valor: producto.produccion});

		// Bloque3
		if (producto.actores) bloque3.push({titulo: "Actores", valor: producto.actores});

		// Fin
		return [bloque1, bloque2, bloque3];
	},
	obtieneLinksDelProducto: async (entidad, id) => {
		// Variables
		const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
		const include = ["tipo", "prov"];
		let PL = [];
		let TR = [];

		// Obtiene los links
		const links = await BD_genericas.obtieneTodosPorCamposConInclude("links", {[campo_id]: id}, include);

		// Procesos si hay links
		if (links.length) {
			// Los ordena
			// 1. Por calidad
			links.sort((a, b) => b.calidad - a.calidad);
			// 2. Por completo
			links.sort((a, b) => b.completo - a.completo);
			// 3. Por idioma
			links.sort((a, b) => b.castellano - a.castellano);

			// Los separa entre Películas y Trailers
			PL = links.filter((n) => n.tipo && n.tipo.trailer);
			TR = links.filter((n) => n.tipo && n.tipo.pelicula);
		}

		// Fin
		return {PL, TR};
	},
};
