module.exports = (sequelize, dt) => {
	const alias = "cn_ordenes";
	const columns = {
		orden: {type: dt.INTEGER},
		layout_id: {type: dt.STRING(20)},
		nombre: {type: dt.STRING(40)},
		valor: {type: dt.STRING(20)},
		ascDes: {type: dt.STRING(20)},
		bhrSeguro: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_ordenes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.cn_layouts, {as: "layout", foreignKey: "layout_id"});
	};
	return entidad;
};
