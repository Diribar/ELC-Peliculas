module.exports = (sequelize, dt) => {
	const alias = "categoria";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(20)}
	};
	const config = {
		tableName: "categorias",
		timestamps: false
	};

	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {entidad.hasMany(n.pelicula, {as: "peliculas",foreignKey: "categoria_id"});};

	return entidad;
};
