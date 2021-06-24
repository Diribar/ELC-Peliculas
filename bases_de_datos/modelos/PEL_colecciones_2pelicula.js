module.exports = (sequelize, dt) => {
	const alias = "colecciones_peliculas";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		pelicula_id: { type: dt.INTEGER },
		tmdb_id: { type: dt.STRING(20) },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
		ano_estreno: { type: dt.INTEGER },
		sinopsis: { type: dt.STRING(800) },
		avatar: { type: dt.STRING(100) },
		coleccion_id: { type: dt.INTEGER },
		orden_secuencia: { type: dt.INTEGER },
	};
	const config = {
		tableName: "colecciones_peliculas",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.colecciones_cabecera, {as: "coleccion_cabecera", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
	};
	return entidad;
};
