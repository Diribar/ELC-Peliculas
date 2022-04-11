module.exports = (sequelize, dt) => {
	const alias = "edic_rech";
	const columns = {
		elc_entidad: {type: dt.STRING(20)},
		elc_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(20)},
		titulo: {type: dt.STRING(21)},
		valor: {type: dt.STRING(20)},

		motivo_id: {type: dt.INTEGER},
		duracion: {type: dt.INTEGER},

		input_por_id: {type: dt.INTEGER},
		input_en: {type: dt.DATE},
		evaluado_por_id: {type: dt.INTEGER},
		evaluado_en: {type: dt.DATE},

		comunicado: {type: dt.BOOLEAN},
		};
	const config = {
		tableName: "edic_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.edic_rech_motivos, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "input_por", foreignKey: "input_por_id"});
		entidad.belongsTo(n.usuarios, {as: "evaluado_por", foreignKey: "evaluado_por_id"});	
	};
	return entidad;
};
