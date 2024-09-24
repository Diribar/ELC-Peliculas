module.exports = (sequelize, dt) => {
	const alias = "tiposDeCliente";
	const columns = {
		fecha: {type: dt.STRING(10)},
		anoMes: {type: dt.STRING(3)},

		// Calidad de clientes
		altasDelDia: {type: dt.INTEGER},
		transicion: {type: dt.INTEGER},
		cincoOMenos: {type: dt.INTEGER},
		masDeCinco: {type: dt.INTEGER},
		masDeQuince: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_tipos_de_cliente",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
