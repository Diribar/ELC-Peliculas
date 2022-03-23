module.exports = (sequelize, dt) => {
	const alias = "meses";
	const columns = {
		nombre: {type: dt.STRING(10)},
		abrev: {type: dt.STRING(3)},
		cant_peliculas: {type: dt.INTEGER},
		cant_colecciones: {type: dt.INTEGER},
	
	};
	const config = {
		tableName: "rclv_meses",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
