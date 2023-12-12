module.exports = (sequelize, dt) => {
	const alias = "loginsDiarios";
	const columns = {
		fecha: {type: dt.DATE},
		usuario_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_logins_diarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
