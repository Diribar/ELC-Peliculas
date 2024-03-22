module.exports = (sequelize, dt) => {
	const alias = "rolesUsuarios";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		codigo: {type: dt.STRING(15)},

		permInputs: {type: dt.BOOLEAN},
		autTablEnts:{type: dt.BOOLEAN},
		revisorPERL: {type: dt.BOOLEAN},
		revisorLinks: {type: dt.BOOLEAN},
		revisorEnts: {type: dt.BOOLEAN},
		revisorUs: {type: dt.BOOLEAN},
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
