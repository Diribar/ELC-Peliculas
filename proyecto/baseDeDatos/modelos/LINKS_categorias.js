module.exports = (sequelize, dt) => {
	const alias = "linksCategs";
	const columns = {
		nombre: {type: dt.STRING(15)},
	};
	const config = {
		tableName: "links_categorias",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.links, {as: "links", foreignKey: "tipo_id"});
	};
	return entidad;
};
