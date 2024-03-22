module.exports = (sequelize, dt) => {
	const alias = "feValores";
	const columns = {
		orden: {type: dt.INTEGER},
		valor: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cal_1fe_valores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
