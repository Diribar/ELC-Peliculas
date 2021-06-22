module.exports = (sequelize, dt) => {
	const alias = "colecciones_peliculas";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		coleccion_titulo_id: {type: dt.INTEGER},
		tmdb_coleccion_id: {type: dt.STRING(20)},
		pelicula_id: {type: dt.INTEGER},
		tmdb_pelicula_id: {type: dt.STRING(20)},
		titulo_original_pelicula: {type: dt.STRING(100)},
		titulo_castellano_pelicula: {type: dt.STRING(100)},
		ano_estreno: {type: dt.INTEGER},
		orden_secuencia: {type: dt.INTEGER},
	};
	const config = {
		tableName: "colecciones_peliculas",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.colecciones_titulos, {as: "coleccion_titulo", foreignKey: "coleccion_titulo_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
	};
	return entidad;
};
