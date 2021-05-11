module.exports = (sequelize, dt) => {
    const alias = "musico";
    const columns  = {
		id: {type: dt.INTEGER, primaryKey: true},
		tmdb_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING}
    }
    const config = {
	tableName: "musicos",
	timestamps: false
    }
    const entidad = sequelize.define(alias, columns, config);
    entidad.associate = n => {
		entidad.belongsToMany(n.pelicula, {
			as: "peliculas", 
			through: "musico_pelicula",
			foreignKey: "musico_id", 
			otherKey: "pelicula_id", 
			timestamps: false 
		})
    }
    return entidad;
}