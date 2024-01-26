module.exports = (sequelize, dt) => {
	const alias = "cn_entsPorOpcion";
	const columns = {
		opcion_id: {type: dt.INTEGER},
		entidad_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
	};
	const config = {
		tableName: "cn_ents_por_opc",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.cn_entidades, {as: "entidad", foreignKey: "entidad_id"});
		entidad.belongsTo(n.cn_opciones, {as: "opcion", foreignKey: "opcion_id"});
	};
	return entidad;
};
