module.exports = (sequelize, dt) => {
	const alias = "tiposDeCliente";
	const columns = {
		fecha: {type: dt.STRING(10)},
		anoMes: {type: dt.STRING(3)},

		// Calidad de clientes
		altasDelDia: {type: dt.INTEGER},
		transicion: {type: dt.INTEGER},
		unoATres: {type: dt.INTEGER},
		unoADiez: {type: dt.INTEGER},
		masDeDiez: {type: dt.INTEGER},
		masDeTreinta: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_tipos_de_cliente",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
