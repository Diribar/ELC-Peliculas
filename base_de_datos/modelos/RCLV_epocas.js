module.exports = (sequelize, dt) => {
	const alias = "epocas";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre_cons: {type: dt.STRING(35)},
		nombre_pers: {type: dt.STRING(15)},
		nombre_hecho: {type: dt.STRING(15)},
		ayuda_pers: {type: dt.STRING(50)},
		ayuda_hecho: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "rclv_epocas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "epoca_id"});
	};
	return entidad;
};
