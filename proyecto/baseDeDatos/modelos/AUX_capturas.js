module.exports = (sequelize, dt) => {
	const alias = "capturas";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		familia: {type: dt.STRING(20)},

		capturadoPor_id: {type: dt.INTEGER},
		capturadoEn: {type: dt.DATE},
		activa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_capturas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});
	};
	return entidad;
};
