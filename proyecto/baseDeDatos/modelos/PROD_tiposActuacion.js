module.exports = (sequelize, dt) => {
	const alias = "tiposActuacion";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		codigo: {type: dt.STRING(15)},
	};
	const config = {
		tableName: "prod_tipos_actuac",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
