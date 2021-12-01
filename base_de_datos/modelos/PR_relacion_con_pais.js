module.exports = (sequelize, dt) => {
	const alias = "relacion_pais_prod";
	const columns = {
		pais_id: { type: dt.STRING(2)},
		pelicula_id: { type: dt.INTEGER },
		coleccion_id: { type: dt.INTEGER },
	};
	const config = {
		tableName: "relacion_pais_prod",
		timestamps: false
	}
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
	};
	return entidad;
}