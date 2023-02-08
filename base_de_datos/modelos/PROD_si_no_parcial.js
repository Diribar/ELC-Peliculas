module.exports = (sequelize, dt) => {
	const alias = "si_no_parcial";
	const columns = {
		productos: {type: dt.STRING(10)},
		links: {type: dt.STRING(10)},
		si: {type: dt.BOOLEAN},
		no: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "prod_si_no_parcial",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	// entidad.associate = (n) => {
		// entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "links_gratis_en_bd_id"});
		// entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "links_gratis_en_bd_id"});
		// entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "links_gratis_en_bd_id"});
	// };
	return entidad;
};
