module.exports = (sequelize, dt) => {
	const alias = "rclvComplem";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},

		capturadoPor_id: {type: dt.INTEGER},
		capturadoEn: {type: dt.DATE},
		capturaActiva: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "rclv_9complem",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});
	};
	return entidad;
};