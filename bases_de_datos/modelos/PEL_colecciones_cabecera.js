module.exports = (sequelize, dt) => {
	const alias = "colecciones_cabecera";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		tmdb_id: { type: dt.STRING(10) },
		tmdb_rubro: { type: dt.STRING(10) },
		fa_id: { type: dt.STRING(10) },
		fuente: { type: dt.STRING(10) },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
		ano_estreno: { type: dt.INTEGER },
		ano_fin: { type: dt.INTEGER },
		pais_id: { type: dt.STRING(2) },
		productor: { type: dt.STRING(50) },
		en_produccion: { type: dt.BOOLEAN },
		sinopsis: { type: dt.STRING(800) },
		avatar: { type: dt.STRING(100) },
	};
	const config = {
		tableName: "colecciones_cabecera",
		timestamps: false,
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.colecciones_peliculas, {as: "coleccion_peliculas",foreignKey: "coleccion_id"});
	};
	return entidad;
};
