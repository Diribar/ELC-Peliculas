module.exports = (sequelize, dt) => {
	const alias = "edics_aprob";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(20)},
		titulo: {type: dt.STRING(21)},
		valor_aprob: {type: dt.STRING(50)},

		input_por_id: {type: dt.INTEGER},
		input_en: {type: dt.DATE},
		evaluado_por_id: {type: dt.INTEGER},
		evaluado_en: {type: dt.DATE},

		comunicado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "edics_aprob",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "input_por", foreignKey: "input_por_id"});
		entidad.belongsTo(n.usuarios, {as: "evaluado_por", foreignKey: "evaluado_por_id"});	
	};
	return entidad;
};
