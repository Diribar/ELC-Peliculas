module.exports = (sequelize, dt) => {
	const alias = "us_interes_en_prod";
	const columns = {
		usuario_id: { type: dt.INTEGER },
		peli_id: { type: dt.INTEGER },
		colec_id: { type: dt.INTEGER },
		interes_en_prod_id: { type: dt.INTEGER },
	};
	const config = {
		tableName: "us_interes_en_prod",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.interes_en_prod, {as: "interes_en_prod", foreignKey: "interes_en_prod_id"});
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "peli_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "colec_id"});
	};
	return entidad;
}