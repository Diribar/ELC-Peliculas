module.exports = (sequelize, dt) => {
	const alias = "calidad_tecnica";
	const columns = {
		orden: {type: dt.INTEGER},
		valor: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cal_calidad_tecnica",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
