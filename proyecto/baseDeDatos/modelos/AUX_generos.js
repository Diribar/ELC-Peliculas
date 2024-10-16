module.exports = (sequelize, dt) => {
	const alias = "generos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(15)},
		pers: {type: dt.STRING(10)},
		rclvs: {type: dt.STRING(10)},
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
