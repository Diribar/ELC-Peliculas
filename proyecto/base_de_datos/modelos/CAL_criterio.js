module.exports = (sequelize, dt) => {
	const alias = "cal_criterio";
	const columns = {
		atributo: {type: dt.STRING(20)},
		atributo_id: {type: dt.STRING(20)},
		ponderacion: {type: dt.INTEGER},
	};
	const config = {
		tableName: "cal_criterio",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
