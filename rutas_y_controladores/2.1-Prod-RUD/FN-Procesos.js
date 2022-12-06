"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	// Producto
	obtieneVersionesDelProducto: async (entidad, prodID, userID) => {
		// Variables
		let includesEdic = comp.includes("productos");
		let includesOrig = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let prodEdic = "";

		// Obtiene el producto ORIGINAL
		let prodOrig = await BD_genericas.obtienePorIdConInclude(entidad, prodID, [
			...includesEdic,
			...includesOrig,
		]);
		prodOrig = comp.quitaCamposSinContenido(prodOrig);

		// Obtiene el producto EDITADO
		let producto_id = comp.obtieneEntidad_id(entidad);
		let datos = ["prods_edicion", {[producto_id]: prodID, editado_por_id: userID}, includesEdic];
		if (userID) prodEdic = await BD_genericas.obtienePorCamposConInclude(...datos);
		if (prodEdic) prodEdic = comp.quitaCamposSinContenido(prodEdic);

		// Fin
		return [prodOrig, prodEdic];
	},
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
		let bloque3 = [{titulo: "Actuación", valor: prodComb.actuacion ? prodComb.actuacion : "Sin datos"}];
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
		// RCLVs
		let RCLVs = (campo, titulo, RCLV_entidad, rel) => {
			let datos = {titulo, RCLV_entidad, valor: prodComb[rel].nombre, RCLV_id: prodComb[rel].id};
			if (prodComb[campo] != 1) bloques.push(datos);
		};
		RCLVs("personaje_id", "Personaje Histórico", "personajes", "personaje");
		RCLVs("hecho_id", "Hecho Histórico", "hechos", "hecho");
		RCLVs("valor_id", "Valor", "valores", "valor");
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
