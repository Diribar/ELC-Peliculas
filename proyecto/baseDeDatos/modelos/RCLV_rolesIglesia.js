module.exports = (sequelize, dt) => {
	const alias = "rolesIglesia";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		MS: {type: dt.STRING(20)},
		FS: {type: dt.STRING(20)},
		MP: {type: dt.STRING(20)},
		FP: {type: dt.STRING(20)},
		MFP: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "rclv_roles_iglesia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "rolIglesia_id"});
	};
	return entidad;
};
