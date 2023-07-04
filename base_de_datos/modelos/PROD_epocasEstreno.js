module.exports = (sequelize, dt) => {
	const alias = "epocasEstreno";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(15)},
		min: {type: dt.INTEGER},
		max: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_epocas_estreno",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
