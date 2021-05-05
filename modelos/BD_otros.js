const db = require("../bases_de_datos/modelos");

module.exports = {
    listadoCompleto: (entidad) => {
		let campo = "nombre";
		entidad == "estado_eclesial" ? campo = "orden" : "";
		return db[entidad].findAll({
			order:[[campo,'ASC']],
		})
    }
};