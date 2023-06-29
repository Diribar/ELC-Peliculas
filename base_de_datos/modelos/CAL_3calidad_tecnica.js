module.exports = (sequelize, dt) => {
	const alias = "calidadTecnica";
	const columns = {
		orden: {type: dt.INTEGER},
		valor: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cal_3calidad_tecnica",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
