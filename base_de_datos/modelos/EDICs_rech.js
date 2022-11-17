module.exports = (sequelize, dt) => {
	const alias = "edics_rech";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(20)},
		titulo: {type: dt.STRING(21)},
		valor_rech: {type: dt.STRING(100)},
		valor_aprob: {type: dt.STRING(100)},

		motivo_id: {type: dt.INTEGER},
		duracion: {type: dt.DECIMAL},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_analizada_por_id: {type: dt.INTEGER},
		edic_analizada_en: {type: dt.DATE},

		comunicado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "edics_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.edic_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "edic_analizada_por_id"});	
	};
	return entidad;
};
