module.exports = (sequelize, dt) => {
	const alias = "publicos_recomendados";
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
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "publico_recomendado_id"});
	};
	return entidad;
};
