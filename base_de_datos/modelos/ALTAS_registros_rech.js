module.exports = (sequelize, dt) => {
	const alias = "altas_registros_rech";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},

		motivo_id: {type: dt.INTEGER},
		duracion: {type: dt.INTEGER},

		input_por_id: {type: dt.INTEGER},
		input_en: {type: dt.DATE},
		evaluado_por_id: {type: dt.INTEGER},
		evaluado_en: {type: dt.DATE},

		comunicado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "altas_registros_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "input_por", foreignKey: "input_por_id"});
		entidad.belongsTo(n.usuarios, {as: "evaluado_por", foreignKey: "evaluado_por_id"});
	};
	return entidad;
};
