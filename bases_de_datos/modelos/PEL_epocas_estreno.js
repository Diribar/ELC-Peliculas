module.exports = (sequelize, dt) => {
	const alias = "epocas_estreno";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(20)}
	};
	const config = {
		tableName: "epocas_estreno",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "epoca_estreno_id"});
	};
	return entidad;
};
