module.exports = (sequelize, dt) => {
	const alias = "roles_iglesia";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(100)},
		usuario: {type: dt.BOOLEAN},
		personaje: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "roles_iglesia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rol_iglesia_id"});
		entidad.hasMany(n.RCLV_personajes_historicos, {as: "personajes", foreignKey: "rol_iglesia_id"});
	};
	return entidad;
};
