module.exports = (sequelize, dt) => {
	const alias = "hoyEstamos";
	const columns = {
		orden: {type: dt.INTEGER},
		entidad: {type: dt.STRING(20)},
		genero_id: {type: dt.STRING(3)},
		comentario: {type: dt.STRING(35)},
	};
	const config = {
		tableName: "rclv_hoyEstamos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.generos, {as: "genero", foreignKey: "genero_id"});
	};
	return entidad;
};
