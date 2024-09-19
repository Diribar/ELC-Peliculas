module.exports = (sequelize, dt) => {
	const alias = "clientesDiarios";
	const columns = {
		fecha: {type: dt.STRING(10)},
		diaSem: {type: dt.STRING(3)},
		anoMes: {type: dt.STRING(3)},
		usLogueado: {type: dt.INTEGER},
		usSinLogin: {type: dt.INTEGER},
		visitaSinUs: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_logins_acums",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
