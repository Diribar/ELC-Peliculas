module.exports = (sequelize, dt) => {
	const alias = "cal_registros";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.STRING(20)},
		valor: {type: dt.INTEGER},
	};
	const config = {
		tableName: "cal_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
