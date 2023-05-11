module.exports = (sequelize, dt) => {
	const alias = "historial_cambios_de_status";
	const columns = {
		entidad: {type: dt.STRING(11)},
		entidad_id: {type: dt.INTEGER},

		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(150)},

		status_original_id: {type: dt.INTEGER},
		status_final_id: {type: dt.INTEGER},

		aprobado: {type: dt.BOOLEAN},
		duracion: {type: dt.DECIMAL},

		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},
		revisado_por_id: {type: dt.INTEGER},
		revisado_en: {type: dt.DATE},
		comunicado_en: {type: dt.DATE},
		};
	const config = {
		tableName: "aux_hist_cambios_status",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizado_por", foreignKey: "revisado_por_id"});

		entidad.belongsTo(n.motivos_rech_altas, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.status_registros, {as: "status_original", foreignKey: "status_original_id"});
		entidad.belongsTo(n.status_registros, {as: "status_final", foreignKey: "status_final_id"});
	}
	return entidad;
};
