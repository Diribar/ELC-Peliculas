module.exports = (sequelize, dt) => {
	const alias = "histStatus";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},

		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(150)},
		aprobado: {type: dt.BOOLEAN},
		penalizac: {type: dt.DECIMAL},

		statusOrig_id: {type: dt.INTEGER},
		statusFinal_id: {type: dt.INTEGER},

		statusOrigPor_id: {type: dt.INTEGER},
		statusFinalPor_id: {type: dt.INTEGER},

		statusOrigEn: {type: dt.DATE},
		statusFinalEn: {type: dt.DATE},

		comunicadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "cam_hist_status",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
