module.exports = (sequelize, dt) => {
	const alias = "historial_comentarios";
	const columns = {
		entidad: {type: dt.STRING(11)},
		entidad_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(150)},

		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},
		motivo_id: {type: dt.INTEGER},

		status_registro_id: {type: dt.INTEGER},
		};
	const config = {
		tableName: "historial_comentarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizado_por", foreignKey: "analizado_por_id"});

		entidad.belongsTo(n.motivos_rech_altas, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.status_registros, {as: "status_registro", foreignKey: "status_registro_id"});
	}
	return entidad;
};
