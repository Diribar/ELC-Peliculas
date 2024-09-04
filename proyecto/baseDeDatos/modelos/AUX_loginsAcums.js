module.exports = (sequelize, dt) => {
	const alias = "loginsAcums";
	const columns = {
		fecha: {type: dt.STRING(10)},
		diaSem: {type: dt.STRING(3)},
		anoMes: {type: dt.STRING(3)},
		cantUsuarios: {type: dt.INTEGER},
		cantVisitas: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_logins_acums",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
