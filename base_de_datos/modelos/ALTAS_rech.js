module.exports = (sequelize, dt) => {
	const alias = "altas_rech";
	const columns = {
		elc_entidad: {type: dt.STRING(20)},
		elc_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		duracion: {type: dt.INTEGER},

		input_por_id: {type: dt.INTEGER},
		input_en: {type: dt.DATE},
		evaluado_por_id: {type: dt.INTEGER},
		evaluado_en: {type: dt.DATE},
		status_registro_id: {type: dt.INTEGER},

		comunicado: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "altas_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.altas_rech_motivos, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "input_por", foreignKey: "input_por_id"});
		entidad.belongsTo(n.usuarios, {as: "evaluado_por", foreignKey: "evaluado_por_id"});
		entidad.belongsTo(n.status_registro_ent, {as: "status_registro", foreignKey: "status_registro_id"});
	};
	return entidad;
};
