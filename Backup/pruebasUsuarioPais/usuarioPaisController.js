// ************ Requires ************
const path = require('path');
const metodosUsuario = require(path.join(__dirname, "../../modelos/BD_usuarios"));

// *********** Controlador ***********
module.exports = {

	listado: async (req,res) => {
		let prueba = await metodosUsuario.obtenerUsuarioPorId(1)
		return res.render("usuarioPaisVista", {prueba})
	},
};
