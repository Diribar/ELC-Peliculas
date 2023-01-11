"use strict";
// Definir variables
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	bloquesIzquierda: (paises,prodComb) => {
		let bloque1 = [
			{titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises ? paises : "Sin datos"},
			{
				titulo: "Idioma original",
				valor: prodComb.idioma_original ? prodComb.idioma_original.nombre : "Sin datos",
			},
			{
				titulo: "En castellano",
				valor: prodComb.en_castellano ? prodComb.en_castellano.productos : "Sin datos",
			},
			{
				titulo: "Es a color",
				valor: prodComb.en_color ? prodComb.en_color.productos : "Sin datos",
			},
		];
		let bloque2 = [
			{titulo: "Dirección", valor: prodComb.direccion ? prodComb.direccion : "Sin datos"},
			{titulo: "Guión", valor: prodComb.guion ? prodComb.guion : "Sin datos"},
			{titulo: "Música", valor: prodComb.musica ? prodComb.musica : "Sin datos"},
			{
				titulo: "Producción",
				valor: prodComb.produccion ? prodComb.produccion : "Sin datos",
			},
		];
		let bloque3 = [{titulo: "Actores", valor: prodComb.actores ? prodComb.actores : "Sin datos"}];
		// Fin
		return [bloque1, bloque2, bloque3];
	},
	bloquesDerecha:(entidad,prodComb)=>{
		// Iniciales
		let bloques=[
			{titulo: "Público Sugerido", valor: comp.valorNombre(prodComb.publico_sugerido, "Sin datos")},
			{titulo: "Categoría", valor: comp.valorNombre(prodComb.categoria, "Sin datos")},
			{titulo: "Sub-categoría", valor: comp.valorNombre(prodComb.subcategoria, "Sin datos")},
		];
		// rclvs
		let rclvs = (campo, titulo, RCLV_entidad, rel) => {
			let datos = {titulo, RCLV_entidad, valor: prodComb[rel].nombre, RCLV_id: prodComb[rel].id};
			if (prodComb[campo] != 1) bloques.push(datos);
		};
		rclvs("personaje_id", "Personaje Histórico", "personajes", "personaje");
		rclvs("hecho_id", "Hecho Histórico", "hechos", "hecho");
		rclvs("valor_id", "Valor", "valores", "valor");
		// Otros
		bloques.push({titulo: "Año de estreno", valor: prodComb.ano_estreno});
		if (entidad == "colecciones")
			bloques.push({titulo: "Año de fin", valor: prodComb.ano_fin});
		else bloques.push({titulo: "Duracion", valor: prodComb.duracion + " min."});
		// Status resumido
		let statusResumido = prodComb.status_registro.gr_creado
		? {id: 1, valor: "Pend. Aprobac."}
		: prodComb.status_registro.aprobado
		? {id: 2, valor: "Aprobado"}
		: {id: 3, valor: "Inactivado"};
		bloques.push({titulo: "Status", ...statusResumido});
		// Fin
		return bloques
	}
};
