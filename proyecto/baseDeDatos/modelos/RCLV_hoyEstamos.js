module.exports = (sequelize, dt) => {
	const alias = "hoyEstamos";
	const columns = {
		entidad: {type: dt.STRING(20)},
		genero_id: {type: dt.STRING(3)},
		nombre: {type: dt.STRING(35)},
	};
	const config = {
		tableName: "rclv_hoy_estamos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.generos, {as: "genero", foreignKey: "genero_id"});
		entidad.hasMany(n.hechos, {as: "hechos", foreignKey: "hoyEstamos_id"});
		entidad.hasMany(n.eventos, {as: "eventos", foreignKey: "hoyEstamos_id"});
	};
	return entidad;
};
