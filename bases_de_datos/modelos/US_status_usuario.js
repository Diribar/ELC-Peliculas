module.exports = (sequelize, dt) => {
	const alias = "status_usuario";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(50)}
	};
	const config = {
		tableName: "status_usuario",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.usuario, {
			as: "usuarios",
			foreignKey: "status_usuario_id"
		});
	};

	return entidad;
};
