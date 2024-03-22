module.exports = (sequelize, dt) => {
	const alias = "epocasEstreno";
	const columns = {
		nombre: {type: dt.STRING(15)},
		desde: {type: dt.INTEGER},
		hasta: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_epocas_estreno",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
