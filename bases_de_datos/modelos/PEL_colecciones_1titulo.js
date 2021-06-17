module.exports = (sequelize, dt) => {
	const alias = "colecciones_titulos";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		tmdb_coleccion_id: { type: dt.INTEGER },
		titulo_original_coleccion: { type: dt.STRING(100) },
		titulo_castellano_coleccion: { type: dt.STRING(100) },
		avatar: { type: dt.STRING(100) },
	};
	const config = {
		tableName: "colecciones_titulos",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.colecciones_peliculas, {as: "colecciones_peliculas",foreignKey: "coleccion_titulo_id"});
	};
	return entidad;
};
