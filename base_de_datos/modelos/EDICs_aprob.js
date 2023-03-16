module.exports = (sequelize, dt) => {
	const alias = "edics_aprob";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(25)},
		titulo: {type: dt.STRING(35)},
		valorAprob: {type: dt.STRING(100)},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_revisada_por_id: {type: dt.INTEGER},
		edic_revisada_en: {type: dt.DATE},

		comunicado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "edics_aprob",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "edic_revisada_por_id"});	
	};
	return entidad;
};
