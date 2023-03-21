module.exports = (sequelize, dt) => {
	const alias = "epocas_hechos";
	const columns = {
		orden: {type: dt.INTEGER},
		consultas: {type: dt.STRING(35)},
		nombre: {type: dt.STRING(15)},
		ayuda: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "rclv_epocas_hechos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "hechos", foreignKey: "epoca_id"});
	};
	return entidad;
};
