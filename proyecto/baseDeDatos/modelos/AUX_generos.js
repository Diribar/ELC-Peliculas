module.exports = (sequelize, dt) => {
	const alias = "generos";
	const columns = {
		orden: {type: dt.INTEGER},
		pers: {type: dt.STRING(10)},
		rclvs: {type: dt.STRING(20)},
		loLa: {type: dt.STRING(3)},
		letraFinal: {type: dt.STRING(2)},
	};
	const config = {
		tableName: "aux_generos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
