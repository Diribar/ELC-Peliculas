module.exports = (sequelize, dt) => {
	const alias = "loginsDelDia";
	const columns = {
		fecha: {type: dt.STRING(10)},
		usuario_id: {type: dt.INTEGER},
		visita_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_logins_del_dia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
