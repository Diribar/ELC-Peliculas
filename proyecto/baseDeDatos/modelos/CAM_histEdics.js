module.exports = (sequelize, dt) => {
	const alias = "histEdics";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(25)},
		titulo: {type: dt.STRING(35)},
		valorDesc: {type: dt.STRING(100)},
		valorAprob: {type: dt.STRING(100)},

		motivo_id: {type: dt.INTEGER},
		penalizac: {type: dt.DECIMAL},

		sugeridoPor_id: {type: dt.INTEGER},
		sugeridoEn: {type: dt.DATE},
		revisadoPor_id: {type: dt.INTEGER},
		revisadoEn: {type: dt.DATE},

		comunicadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "cam_hist_edics",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.motivosEdics, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "statusSugeridoPor", foreignKey: "sugeridoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "revisadoPor", foreignKey: "revisadoPor_id"});
	};
	return entidad;
};
