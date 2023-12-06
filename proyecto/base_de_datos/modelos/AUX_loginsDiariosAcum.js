module.exports = (sequelize, dt) => {
	const alias = "loginsDiariosAcum";
	const columns = {
		fecha: {type: dt.DATE},
		diaSem: {type: dt.STRING(3)},
		mes: {type: dt.STRING(3)},
		logins: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_logins_diarios_acum",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
