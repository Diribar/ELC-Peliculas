module.exports = (sequelize, dt) => {
	const alias = "roles_iglesia";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		plural: {type: dt.STRING(20)},
		grupo: {type: dt.BOOLEAN},
		usuario: {type: dt.BOOLEAN},
		personaje: {type: dt.BOOLEAN},
		varon: {type: dt.BOOLEAN},
		mujer: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_roles_iglesia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rolIglesia_id"});
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "rolIglesia_id"});
	};
	return entidad;
};
