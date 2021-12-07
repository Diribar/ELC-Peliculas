module.exports = (sequelize, dt) => {
	const alias = "relacion_pais_prod";
	const columns = {
		pais_id: {type: dt.STRING(2)},
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "pr_relacion_pais_prod",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.paises, {as: "paises", foreignKey: "pais_id"});
		entidad.belongsTo(n.peliculas, {as: "peliculas", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "colecciones", foreignKey: "coleccion_id"});
	};
	return entidad;
};
