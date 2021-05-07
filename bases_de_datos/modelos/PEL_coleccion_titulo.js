module.exports = (sequelize, dt) => {
	const alias = "coleccion_titulo";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		tmdb_coleccion_id: {type: dt.STRING(20)},
		titulo_original_coleccion: {type: dt.STRING(100)},
		titulo_castellano_coleccion: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "colecciones_titulos",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.coleccion_pelicula, {as: "coleccion_pelicula",foreignKey: "coleccion_id"});
	};

	return entidad;
};
