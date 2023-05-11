module.exports = (sequelize, dt) => {
	const alias = "edics_rech";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(25)},
		titulo: {type: dt.STRING(35)},
		valorRech: {type: dt.STRING(100)},
		valorAprob: {type: dt.STRING(100)},

		motivo_id: {type: dt.INTEGER},
		duracion: {type: dt.DECIMAL},

		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},
		revisado_por_id: {type: dt.INTEGER},
		revisado_en: {type: dt.DATE},
		comunicado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "edics_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.motivos_rech_edic, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "edic_revisada_por_id"});	
	};
	return entidad;
};
