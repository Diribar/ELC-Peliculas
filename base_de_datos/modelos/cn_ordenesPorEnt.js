module.exports = (sequelize, dt) => {
	const alias = "cn_entsPorOrdenes";
	const columns = {
		nombre: {type: dt.STRING(40)},
		entidad_id: {type: dt.INTEGER},
		orden_id: {type: dt.INTEGER},

		boton: {type: dt.INTEGER},
		ordenDefault: {type: dt.BOOLEAN},
		bhrSeguro: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_entidades_por_ords",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.cn_entidades, {as: "entidad", foreignKey: "entidad_id"});
		entidad.belongsTo(n.cn_ordenes, {as: "orden", foreignKey: "orden_id"});
	};
	return entidad;
};
