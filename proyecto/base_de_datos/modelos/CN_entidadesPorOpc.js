module.exports = (sequelize, dt) => {
	const alias = "cn_entsPorLayout";
	const columns = {
		layout_id: {type: dt.INTEGER},
		entidad_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
	};
	const config = {
		tableName: "cn_ents_por_layout",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.cn_entidades, {as: "entidad", foreignKey: "entidad_id"});
		entidad.belongsTo(n.cn_layouts, {as: "layout", foreignKey: "layout_id"});
	};
	return entidad;
};
