module.exports = (sequelize, dt) => {
	const alias = "roles_iglesia";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(100)},
		usuario: {type: dt.BOOLEAN},
		personaje: {type: dt.BOOLEAN},
		sexo_id: {type: dt.STRING(1)},
	};
	const config = {
		tableName: "roles_iglesia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rol_iglesia_id"});
		entidad.hasMany(n.RCLV_personajes, {as: "personajes", foreignKey: "rol_iglesia_id"});
	};
	return entidad;
};
