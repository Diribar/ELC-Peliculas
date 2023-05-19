module.exports = (sequelize, dt) => {
	const alias = "hist_ediciones";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(25)},
		titulo: {type: dt.STRING(35)},
		valorDesc: {type: dt.STRING(100)},
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
		tableName: "cam_hist_ediciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.motivos_edics, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisado_por_id"});	
	};
	return entidad;
};
