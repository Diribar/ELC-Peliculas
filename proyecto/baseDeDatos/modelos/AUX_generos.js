module.exports = (sequelize, dt) => {
	const alias = "generos";
	const columns = {
		orden: {type: dt.INTEGER},
		pers: {type: dt.STRING(10)},
		rclvs: {type: dt.STRING(20)},
		letraFinal: {type: dt.STRING(2)},
	};
	const config = {
		tableName: "aux_generos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "genero_id"});
	};
	return entidad;
};
