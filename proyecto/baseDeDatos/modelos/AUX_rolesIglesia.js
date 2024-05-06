module.exports = (sequelize, dt) => {
	const alias = "rolesIglesia";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		M: {type: dt.STRING(20)},
		F: {type: dt.STRING(20)},
		X: {type: dt.STRING(20)},
		grupo: {type: dt.BOOLEAN},
		usuario: {type: dt.BOOLEAN},
		personaje: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_roles_iglesia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "rolIglesia_id"});
	};
	return entidad;
};
