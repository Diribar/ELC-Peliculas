module.exports = (sequelize, dt) => {
	const alias = "histStatus";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},

		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(150)},
		aprobado: {type: dt.BOOLEAN},
		penalizac: {type: dt.DECIMAL},

		statusOriginal_id: {type: dt.INTEGER},
		statusFinal_id: {type: dt.INTEGER},

		statusOriginalPor_id: {type: dt.INTEGER},
		statusFinalPor_id: {type: dt.INTEGER},

		statusOriginalEn: {type: dt.DATE},
		statusFinalEn: {type: dt.DATE},

		comunicadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "cam_hist_status",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "statusOriginalPor", foreignKey: "statusOriginalPor_id"});
		entidad.belongsTo(n.usuarios, {as: "statusFinalPor", foreignKey: "statusFinalPor_id"});

		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.statusRegistros, {as: "statusOriginal", foreignKey: "statusOriginal_id"});
		entidad.belongsTo(n.statusRegistros, {as: "statusFinal", foreignKey: "statusFinal_id"});
	};
	return entidad;
};
