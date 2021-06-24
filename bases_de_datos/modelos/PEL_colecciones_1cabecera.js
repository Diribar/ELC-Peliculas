module.exports = (sequelize, dt) => {
	const alias = "colecciones_cabecera";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		tmdb_id: { type: dt.STRING(20) },
		rubro: { type: dt.STRING(20) },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
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
