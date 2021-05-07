module.exports = (sequelize, dt) => {
	const alias = "coleccion__pelicula";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		coleccion_id: {type: dt.INTEGER},
		tmdb_coleccion_id: {type: dt.STRING(20)},
		pelicula_id: {type: dt.INTEGER},
		tmdb_pelicula_id: {type: dt.STRING(20)},
		titulo_original: {type: dt.STRING(100)},
		titulo_castellano: {type: dt.STRING(100)},
		ano_estreno: {type: dt.INTEGER},
	};
	const config = {
		tableName: "coleccion-pelicula",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);

	entidad.associate = n => {
		entidad.belongsTo(n.coleccion, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.pelicula, {as: "pelicula", foreignKey: "pelicula_id"});

	};

	return entidad;
};
