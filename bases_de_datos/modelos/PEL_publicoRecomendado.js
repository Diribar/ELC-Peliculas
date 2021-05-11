module.exports = (sequelize, dt) => {
	const alias = "publico_recomendado";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(20)}
	};
	const config = {
		tableName: "publicos_recomendados",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.pelicula, {as: "peliculas",foreignKey: "publico_recomendado_id"});
	};
	return entidad;
};
