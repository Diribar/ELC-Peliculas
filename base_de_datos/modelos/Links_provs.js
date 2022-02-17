module.exports = (sequelize, dt) => {
	const alias = "links_provs";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		avatar: {type: dt.STRING(20)},
		siempre_pago: {type: dt.BOOLEAN},
		url: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "links_provs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.links_prod, {as: "links", foreignKey: "link_prov_id"});
	};
	return entidad;
};
