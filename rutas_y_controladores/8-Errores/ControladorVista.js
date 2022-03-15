// ************ Requires ************
let validarRCLV = require("../../funciones/Varias/ValidarRCLV");
let BD_varias = require("../../funciones/BD/varias");
let procesar = require("../../funciones/Prod-RUD/1-Procesar");

// *********** Controlador ***********
module.exports = {
	prodNoEncontrado: (req, res) => {
		return res.send("Producto no encontrado");
	},

	prodNoAprobado: (req, res) => {
		// Tomar datos de session o cookies
		noAprobado = req.session.noAprobado
			? req.session.noAprobado
			: req.cookies.noAprobado
			? req.cookies.noAprobado
			: "";
		let frase = "El producto no está aprobado para ser mostrado. Status actual: ";
		return res.send(frase + noAprobado.status_registro.nombre);
		return res.send("El producto no está aprobado para ser mostrado. Status actual: ");
	},

	soloAutInput: (req, res) => {
		return res.send("Se requiere autorización para ingresar información a nuestro sistema.")
	}
};
