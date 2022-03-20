// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");

// *********** Controlador ***********
module.exports = {
	prodNoEncontrado: (req, res) => {
		let mensaje = "Producto no encontrado"
		return res.render("Errores", {mensaje})
	},

	prodNoAprobado: (req, res) => {
		// Tomar datos de session o cookies
		noAprobado = req.session.noAprobado
			? req.session.noAprobado
			: req.cookies.noAprobado
			? req.cookies.noAprobado
			: "";
		let mensaje = "El producto no está aprobado para ser mostrado. Status actual: " + noAprobado.status_registro.nombre;
		return res.render("Errores", {mensaje})
	},

	soloAutInput: (req, res) => {
		let mensaje = "Se requiere aumentar el nivel de confianza, para ingresar información a nuestro sistema. Podés gestionarlo vos mismo haciendo click acá."
		return res.render("Errores", {mensaje})
	},

	soloGestionProd: (req, res) => {
		let mensaje = "Se requiere aumentar el nivel de confianza, para revisar la información ingresada a nuestro sistema. Si estás interesado/a, lo podés gestionar haciendo click acá."
		return res.render("Errores", {mensaje})
	},

};
