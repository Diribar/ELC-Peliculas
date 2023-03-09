"use strict";
// Requires
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	bloquesIzquierda: (paisesNombre, prodComb) => {
		let bloque1 = [
			{titulo: "Tipo de Actuación", valor: prodComb.tipo_actuacion ? prodComb.tipo_actuacion.nombre : "Sin datos"},
			{
				titulo: "País" + (paisesNombre && paisesNombre.includes(",") ? "es" : ""),
				valor: paisesNombre ? paisesNombre : "Sin datos",
			},
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
			if (prodComb[rel].id != 1)
				bloques.push({titulo, RCLV_entidad, valor: prodComb[rel].nombre, RCLV_id: prodComb[rel].id});
		};
		rclvs("Pers. Histórico", "personajes", "personaje");
		rclvs("Hecho Histórico", "hechos", "hecho");
		rclvs("Valor", "valores", "valor");
		// Otros
		bloques.push({titulo: "Año de estreno", valor: prodComb.ano_estreno});
		if (entidad == "colecciones") bloques.push({titulo: "Año de fin", valor: prodComb.ano_fin});
		else bloques.push({titulo: "Duracion", valor: prodComb.duracion + " min."});
		// Status resumido
		let statusResumido = prodComb.status_registro.aprobado
			? {id: 2, valor: "Aprobado"}
			: prodComb.status_registro.inactivo
			? {id: 3, valor: "Inactivo"}
			: {id: 1, valor: "Pend. Aprobac."};
		// Variable ultimaActualizacion
		let fechas = [prodComb.creado_en, prodComb.sugerido_en];
		if (prodComb.alta_analizada_en) fechas.push(prodComb.alta_analizada_en)
		if (prodComb.editado_en) fechas.push(prodComb.editado_en)
		if (prodComb.edic_analizada_en) fechas.push(prodComb.edic_analizada_en)
		let ultimaActualizacion = comp.fechaDiaMesAno(new Date(Math.max(...fechas)));
		// Datos del registro
		let valorNombreApellido = (valor) => {
			return valor ? (valor.apodo ? valor.apodo : valor.nombre) : "Ninguno";
		};
		bloques.push(
			{titulo: "Creado el", valor: comp.fechaDiaMesAno(prodComb.creado_en)},
			{titulo: "Creado por", valor: valorNombreApellido(prodComb.creado_por)},
			{titulo: "Última revisión", valor: ultimaActualizacion},
			{titulo: "Status", ...statusResumido}
		);
		// Fin
		return bloques;
	},
};
