"use strict";
// Requires
const especificas = require("../../funciones/Varias/Especificas");
const BD_genericas = require("../../funciones/BD/Genericas");

module.exports = async (req, res, next) => {
	// - Revisa si tiene capturas en alguno de: 3 Tipos de Producto, 3 Tipos de RCLV
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
