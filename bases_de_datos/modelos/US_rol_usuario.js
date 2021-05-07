module.exports = (sequelize, dt) => {
	const alias = "rol_usuario";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(20)}
	};
	const config = {
		tableName: "roles_usuario",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "rol_usuario_id"
		});
	};

	return entidad;
};
