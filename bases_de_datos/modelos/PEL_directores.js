module.exports = (sequelize, dt) => {
    const alias = "director";
    const columns  = {
		id: {type: dt.INTEGER, primaryKey: true},
		tmdb_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING}
    }
    const config = {
	tableName: "directores",
	timestamps: false
    }
    const entidad = sequelize.define(alias, columns, config);
    entidad.associate = n => {
		entidad.belongsToMany(n.pelicula, {
			as: "peliculas", 
			through: "director_pelicula",
			foreignKey: "director_id", 
			otherKey: "pelicula_id", 
			timestamps: false 
		})
    }
    return entidad;
}