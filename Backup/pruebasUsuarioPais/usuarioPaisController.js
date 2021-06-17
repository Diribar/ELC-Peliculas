// ************ Requires ************
const path = require('path');
const metodosUsuario = require(path.join(__dirname, "../../modelos/bases_de_datos/BD_usuarios"));

// *********** Controlador ***********
module.exports = {

	listado: async (req,res) => {
		let prueba = await metodosUsuario.obtenerPorId(1)
		return res.render("usuarioPaisVista", {prueba})
	},
};
