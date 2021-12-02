module.exports = (sequelize, dt) => {
	const alias = "status_registro_usuario";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "status_registro_usuario",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "status_registro_id"});
	};
	return entidad;
};
