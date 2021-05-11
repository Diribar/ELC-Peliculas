module.exports = (sequelize, dt) => {
	const alias = "personaje_historico";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(20)}
	};
	const config = {
		tableName: "personajes_historicos",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.pelicula, {as: "peliculas",foreignKey: "personaje_historico_id"});
	};
	return entidad;
};
