module.exports = (sequelize, dt) => {
	const alias = "roles_usuarios";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		aut_input: {type: dt.BOOLEAN},
		aut_gestion_prod: {type: dt.BOOLEAN},
		aut_gestion_us: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_aux_roles",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rol_usuario_id"});
	};
	return entidad;
};
