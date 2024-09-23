module.exports = (sequelize, dt) => {
	const alias = "clientesAcums";
	const columns = {
		fecha: {type: dt.STRING(10)},
		diaSem: {type: dt.STRING(3)},
		anoMes: {type: dt.STRING(3)},
		logins: {type: dt.INTEGER},
		usSinLogin: {type: dt.INTEGER},
		visitas: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_clientes_acums",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
