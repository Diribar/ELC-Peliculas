module.exports = (sequelize, dt) => {
	const alias = "provs_links";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		avatar: {type: dt.STRING(20)},
		siempre_pago: {type: dt.BOOLEAN},
		url: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "proveedores_links",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.prod_links, {as: "links", foreignKey: "proveedor_id"});
	};
	return entidad;
};
