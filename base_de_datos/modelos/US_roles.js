module.exports = (sequelize, dt) => {
	const alias = "roles_usuarios";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		perm_inputs: {type: dt.BOOLEAN},
		revisor_ents: {type: dt.BOOLEAN},
		revisor_us: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_roles",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rol_usuario_id"});
	};
	return entidad;
};
