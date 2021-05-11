module.exports = (sequelize, dt) => {
    const alias = "actor"; // cómo voy a llamar a mi tabla desde otros archivos
    const columns  = {
		id: {type: dt.INTEGER, primaryKey: true},
		tmdb_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING}
    }
    const config = {
	tableName: "actores", // es el nombre de la tabla en MySQL
	timestamps: false
    }
    const entidad = sequelize.define(alias, columns, config);
    entidad.associate = n => { //"entidad" es el nombre previo al "sequelize.define"
		entidad.belongsToMany(n.pelicula, { //"pelicula" es el nombre dado en el alias
			as: "peliculas", // nombre asignado por mí a la relación
			through: "actor_pelicula",
			foreignKey: "actor_id", // es el campo de "actor_pelicula" con el id en común
			otherKey: "pelicula_id", // es el campo de "actor_pelicula" con el id en común c/pelicula
			timestamps: false // si "actor_pelicula" no lo tiene
		})
		entidad.hasMany(n.personaje, {as: "personajes",foreignKey: "actor_id"});
    }

    return entidad;
}