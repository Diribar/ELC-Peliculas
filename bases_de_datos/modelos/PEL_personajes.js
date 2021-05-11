module.exports = (sequelize, dt) => {
	const alias = "personaje";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		actor_id: {type: dt.INTEGER},
		pelicula_id: {type: dt.INTEGER},
		personaje: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "actor_pelicula",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.pelicula, {as: "peliculas",foreignKey: "categoria_id"});
		entidad.hasMany(n.subcategoria, {as: "subcategorias",foreignKey: "categoria_id"});
	};
	return entidad;
};
