module.exports = (sequelize, dt) => {
	const alias = "links_tipos";
	const columns = {
		nombre: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "links_tipos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.links_prods, {as: "links_prods", foreignKey: "link_tipo_id"});
	};
	return entidad;
};
