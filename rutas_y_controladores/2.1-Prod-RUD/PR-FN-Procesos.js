"use strict";
// Requires
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	bloquesIzquierda: (paises, prodComb) => {
		let bloque1 = [
			{titulo: "Tipo de Actuación", valor: prodComb.tipo_actuacion ? prodComb.tipo_actuacion.nombre : "Sin datos"},
			{titulo: "País" + (paises && paises.includes(",") ? "es" : ""), valor: paises ? paises : "Sin datos"},
			{titulo: "Idioma original", valor: prodComb.idioma_original ? prodComb.idioma_original.nombre : "Sin datos"},
			{titulo: "En castellano", valor: prodComb.en_castellano ? "SI" : prodComb.en_castellano === 0 ? "NO" : "Sin datos"},
			{titulo: "Es a color", valor: prodComb.en_color ? "SI" : prodComb.en_color === 0 ? "NO" : "Sin datos"},
		];
		let bloque2 = [
			{titulo: "Dirección", valor: prodComb.direccion ? prodComb.direccion : "Sin datos"},
			{titulo: "Guión", valor: prodComb.guion ? prodComb.guion : "Sin datos"},
			{titulo: "Música", valor: prodComb.musica ? prodComb.musica : "Sin datos"},
			{titulo: "Producción", valor: prodComb.produccion ? prodComb.produccion : "Sin datos"},
		];
		let bloque3 = [{titulo: "Actores", valor: prodComb.actores ? prodComb.actores : "Sin datos"}];
		// Fin
		return [bloque1, bloque2, bloque3];
	},
	bloquesDerecha: (entidad, prodComb) => {
		// Iniciales
		let bloques = [
			{titulo: "Público Sugerido", valor: comp.valorNombre(prodComb.publico, "Sin datos")},
			{titulo: "Categoría", valor: comp.valorNombre(prodComb.categoria, "Sin datos")},
		];
		// rclvs
		let rclvs = (titulo, RCLV_entidad, rel) => {
			if (prodComb[rel]) bloques.push({titulo, RCLV_entidad, valor: prodComb[rel].nombre, RCLV_id: prodComb[rel].id});
		};
		rclvs("Personaje Histórico", "personajes", "personaje");
		rclvs("Hecho Histórico", "hechos", "hecho");
		rclvs("Valor", "valores", "valor");
		// Otros
		bloques.push({titulo: "Año de estreno", valor: prodComb.ano_estreno});
		if (entidad == "colecciones") bloques.push({titulo: "Año de fin", valor: prodComb.ano_fin});
		else bloques.push({titulo: "Duracion", valor: prodComb.duracion + " min."});
		// Status resumido
		let statusResumido = prodComb.status_registro.gr_creado
			? {id: 1, valor: "Pend. Aprobac."}
			: prodComb.status_registro.aprobado
			? {id: 2, valor: "Aprobado"}
			: {id: 3, valor: "Inactivado"};
		bloques.push({titulo: "Status", ...statusResumido});
		// Fin
		return bloques;
	},
};
