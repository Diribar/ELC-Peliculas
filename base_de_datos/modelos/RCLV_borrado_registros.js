module.exports = (sequelize, dt) => {
	const alias = "RCLV_borrados";
	const columns = {
		entidad: {type: dt.STRING(11)},
		registro_id: {type: dt.INTEGER},
		borrado_por_id: {type: dt.INTEGER},
		borrado_en: {type: dt.DATE},
		motivo: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "RCLV_borrados",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "borrado_por", foreignKey: "borrado_por_id"});
	};
	return entidad;
};
