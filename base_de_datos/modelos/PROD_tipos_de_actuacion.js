module.exports = (sequelize, dt) => {
	const alias = "tipos_actuacion";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "prod_tipos_actuacion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
