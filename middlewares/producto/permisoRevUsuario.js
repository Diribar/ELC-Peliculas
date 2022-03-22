"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_especificas = require("../../funciones/BD/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// Definir variables
	let userID = req.session.usuario.id;
	let haceUnaHora = especificas.haceUnaHora();
	let mensaje;
	// CONTROLES PARA PRODUCTO *******************************************************
	// - Revisa si tiene capturas en alguno de: 3 Tipos de Producto, 3 Tipos de RCLV
	// let entidades=["peliculas","colecciones","capitulos","RCLV_personajes","RCLV_hechos","RCLV_valores"]
	// let resultado=[]
	// entidades.forEach((entidad,indice)=> {
	// 	let lectura=await BD_especificas.obtenerEntidadesCapturadas(entidad,)
	// 	resultado.push(lectura)
	// })
	// for (entidad of ) {
		
	// }
	// 1. Sin capturas de otros productos
	// 	--> NEXT
	// 2. Con capturas de otros productos
	// 	3. Con capturas < 1 hora
	// 		--> REDIRECCIONA: 'Tenés que liberar estos casos...'
	// 	3. Sin capturas < 1 hora
	// 		--> Las LIBERA + NEXT
	// Fin
	if (mensaje) return res.render("Errores", {mensaje});
	next();
};
