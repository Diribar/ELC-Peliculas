module.exports = (sequelize, dt) => {
	const alias = "rol_usuario";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(100)}
	};
	const config = {
		tableName: "roles_usuario",
		timestamps: false
	};

	const rol_usuario = sequelize.define(alias,columns,config);

	rol_usuario.associate = n => {
		rol_usuario.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "rol_usuario_id"
		});
	};

	return rol_usuario;
};
