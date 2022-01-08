module.exports = (sequelize, dt) => {
	const alias = "RCLV_borrado_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		penalizacion_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "RCLV_borrado_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.penalizaciones_motivos, {as: "penalizacion_asociada", foreignKey: "penalizacion_id"});
	};
	return entidad;
};
