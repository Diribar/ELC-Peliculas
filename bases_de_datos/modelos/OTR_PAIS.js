module.exports = (sequelize, dt) => {
	const alias = "pais";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		alpha3code: {type: dt.STRING(3)},
		nombre: {type: dt.STRING(100)},
		continente: {type: dt.STRING(20)},
		idioma: {type: dt.STRING(50)},
		zona_horaria: {type: dt.STRING(10)},
		bandera: {type: dt.STRING(100)},
		orden: {type: dt.INTEGER},
	};
	const config = {
		tableName: "paises",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.usuario, {as: "usuarios",foreignKey: "pais_id"});
		entidad.hasMany(n.pelicula, {as: "peliculas",foreignKey: "pais_id"});
	};
	return entidad;
};
