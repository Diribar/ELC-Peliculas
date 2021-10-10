module.exports = (sequelize, dt) => {
	const alias = "roles_usuarios";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
		aut_altas_productos: { type: dt.BOOLEAN },
		aut_aprobar_altas_prod: { type: dt.BOOLEAN },
		aut_cambiar_perfil_usuarios: { type: dt.BOOLEAN },
	};
	const config = {
		tableName: "roles_usuario",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "rol_usuario_id"});
	};
	return entidad;
};
