module.exports = (sequelize, dt) => {
	const alias = "status_usuario";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(100)}
	};
	const config = {
		tableName: "status_usuario",
		timestamps: false
	};

	const status_usuario = sequelize.define(alias,columns,config);

	status_usuario.associate = n => {
		status_usuario.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "status_usuario_id"
		});
	};

	return status_usuario;
};
