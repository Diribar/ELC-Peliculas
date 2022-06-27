module.exports = (sequelize, dt) => {
	const alias = "historial_rclv_eliminados";
	const columns = {
		entidad: {type: dt.STRING(20)},
		nombre_rech: {type: dt.STRING(50)},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		eliminado_por_id: {type: dt.INTEGER},
		eliminado_en: {type: dt.DATE},
		motivo_id: {type: dt.INTEGER},

		duracion: {type: dt.DECIMAL},
		comunicado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "aux_historial_de_rclv_eliminados",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "eliminado_por", foreignKey: "eliminado_por_id"});
		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
	};
	return entidad;
};
