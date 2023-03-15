"use strict";
// Requires
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");

module.exports = {
	// Producto
	bloqueIzq: (producto) => {
		// Variables
		const paisesNombre = producto.paises_id ? comp.paises_idToNombre(producto.paises_id) : "";
		let [bloque1, bloque2, bloque3] = [[], [], []];

		// Bloque1
		if (producto.tipo_actuacion) bloque1.push({titulo: "Tipo de Actuación", valor: producto.tipo_actuacion.nombre});
		if (producto.idioma_original) bloque1.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});
		if (producto.en_castellano !== null) bloque1.push({titulo: "En castellano", valor: producto.en_castellano ? "SI" : "NO"});
		if (producto.en_color !== null) bloque1.push({titulo: "Es a color", valor: producto.en_color ? "SI" : "NO"});
		if (paisesNombre) bloque1.push({titulo: "País" + (paisesNombre.includes(",") ? "es" : ""), valor: paisesNombre});

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
	bloqueDer: (producto) => {
		// Variable
		let bloque = [];

		// Público sugerido y categoría
		bloque.push({titulo: "Público Sugerido", valor: comp.valorNombre(producto.publico, "Sin datos")});
		bloque.push({titulo: "Categoría", valor: comp.valorNombre(producto.categoria, "Sin datos")});

		// RCLVs
		let rclvs = (titulo, RCLV_entidad, rel) => {
			if (producto[rel].id != 1)
				bloque.push({titulo, RCLV_entidad, valor: producto[rel].nombre, RCLV_id: producto[rel].id});
		};
		rclvs("Pers. Histórico", "personajes", "personaje");
		rclvs("Hecho Histórico", "hechos", "hecho");
		rclvs("Valor", "valores", "valor");

		// Años y Duración
		bloque.push({titulo: "Año de estreno", valor: producto.ano_estreno});
		if (producto.coleccion_id) bloque.push({titulo: "Año de fin", valor: producto.ano_fin});
		else bloque.push({titulo: "Duracion", valor: producto.duracion + " min."});

		// Datos CRUD
		bloque.push({titulo: "Creado el", valor: comp.fechaDiaMesAno(producto.creado_en)});
		bloque.push({
			titulo: "Creado por",
			valor: producto.creado_por.apodo ? producto.creado_por.apodo : producto.creado_por.nombre,
		});
		let fechas = [producto.sugerido_en];
		if (producto.alta_analizada_en) fechas.push(producto.alta_analizada_en);
		if (producto.editado_en) fechas.push(producto.editado_en);
		if (producto.edic_analizada_en) fechas.push(producto.edic_analizada_en);
		let ultimaActualizacion = comp.fechaDiaMesAno(new Date(Math.max(...fechas)));
		bloque.push({titulo: "Última revisión", valor: ultimaActualizacion});

		// Status resumido
		let statusResumido = procsCRUD.statusResumido(producto);
		bloque.push({titulo: "Status", ...statusResumido});

		// Fin
		return bloque;
	},
};
