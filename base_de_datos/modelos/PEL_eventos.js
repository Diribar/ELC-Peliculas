module.exports = (sequelize, dt) => {
	const alias = "eventos";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(50)},
		fecha: {type: dt.STRING(20)},
		distancia: {type: dt.INTEGER}
	};
	const config = {
		tableName: "eventos",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "sugerida_para_evento_id"});
	};
	return entidad;
};
