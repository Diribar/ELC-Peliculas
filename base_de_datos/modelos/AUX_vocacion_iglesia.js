module.exports = (sequelize, dt) => {
	const alias = "vocacion_iglesia";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "vocacion_iglesia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "vocacion_id"});
	};
	return entidad;
};
