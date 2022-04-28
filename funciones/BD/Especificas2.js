"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;

module.exports = {
	// Varios
	validarRepetidos: (campos, datos) => {
		// El mismo valor para los campos
		let objeto = {};
		for (let campo of campos) objeto[campo] = datos[campo];

		// Distinto ID
		if (datos.id) objeto = {...objeto, id: {[Op.ne]: datos.id}};
		return db[datos.entidad].findOne({where: objeto}).then((n) => (n ? n.id : false));
	},
};
