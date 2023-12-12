module.exports = (sequelize, dt) => {
	const alias = "loginsAcums";
	const columns = {
		fecha: {type: dt.DATE},
		diaSem: {type: dt.STRING(3)},
		anoMes: {type: dt.STRING(3)},
		cantLogins: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_logins_acums",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
