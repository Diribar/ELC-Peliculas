module.exports = (sequelize, dt) => {
	const alias = "cn_ordenesPorEnts";
	const columns = {
		entidad_id: {type: dt.INTEGER},
		orden_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		boton: {type: dt.INTEGER},
		ordenDefault: {type: dt.BOOLEAN},
		activo: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_ordenes_por_ent",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.cn_entidades, {as: "entidad", foreignKey: "entidad_id"});
		entidad.belongsTo(n.cn_ordenes, {as: "orden", foreignKey: "orden_id"});
	};
	return entidad;
};
