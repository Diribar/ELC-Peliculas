module.exports = (sequelize, dt) => {
	const alias = "entretiene";
	const columns = {
		orden: {type: dt.INTEGER},
		valor: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cal_2entretiene",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
