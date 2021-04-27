// ************ Requires ************
const path = require('path');
const db = require(path.join(__dirname, '../../bases_de_datos/modelos'));

// *********** Controlador ***********
module.exports = {

	listado: (req,res) => {
		//return res.send("estoy acá")
		db.usuario.findAll()
		.then(n => res.render("listado", {listado: n}))
		}
};
