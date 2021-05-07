module.exports = (sequelize, dt) => {
	const alias = "coleccion";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		tmdb_id: {type: dt.STRING(20)},
		titulo_original: {type: dt.STRING(100)},
		titulo_castellano: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "colecciones",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.hasMany(n.coleccion__pelicula, {as: "coleccion__pelicula",foreignKey: "coleccion_id"});
	};

	return entidad;
};
