// ************ Requires ************
const path = require('path');
const db = require(path.join(__dirname, '../../bases_de_datos/modelos'));

// *********** Controlador ***********
module.exports = {

	listado: async (req,res) => {
		//return res.send("estoy acá")
		let listado = await db.usuario.findAll({include:["pais","rol_usuario","status_usuario", "estado_eclesial", "sexo"]})

		return res.render("listado", {listado})
		}
};
