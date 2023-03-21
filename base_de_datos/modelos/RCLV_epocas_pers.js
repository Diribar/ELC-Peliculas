module.exports = (sequelize, dt) => {
	const alias = "epocas_pers";
	const columns = {
		orden: {type: dt.INTEGER},
		consulta: {type: dt.STRING(35)},
		nombre: {type: dt.STRING(15)},
		ayuda: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "rclv_epocas_pers",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "epoca_id"});
	};
	return entidad;
};
