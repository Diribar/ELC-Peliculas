module.exports = (sequelize, dt) => {
	const alias = "histStatus";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},

		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(150)},

		statusOriginal_id: {type: dt.INTEGER},
		statusFinal_id: {type: dt.INTEGER},

		aprobado: {type: dt.BOOLEAN},
		penalizac: {type: dt.DECIMAL},

		sugeridoPor_id: {type: dt.INTEGER},
		sugeridoEn: {type: dt.DATE},
		revisadoPor_id: {type: dt.INTEGER},
		revisadoEn: {type: dt.DATE},
		comunicadoEn: {type: dt.DATE},
		};
	const config = {
		tableName: "cam_hist_status",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "statusSugeridoPor", foreignKey: "sugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "revisadoPor", foreignKey: "revisadoPor_id"});

		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.statusRegistros, {as: "statusOriginal", foreignKey: "statusOriginal_id"});
		entidad.belongsTo(n.statusRegistros, {as: "statusFinal", foreignKey: "statusFinal_id"});
	}
	return entidad;
};
