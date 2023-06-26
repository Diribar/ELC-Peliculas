module.exports = (sequelize, dt) => {
	const alias = "roles_usuarios";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		permInputs: {type: dt.BOOLEAN},
		revisorEnts: {type: dt.BOOLEAN},
		revisorUs: {type: dt.BOOLEAN},
		omnipotente: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_roles",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rolUsuario_id"});
	};
	return entidad;
};
