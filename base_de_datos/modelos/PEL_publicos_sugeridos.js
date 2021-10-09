module.exports = (sequelize, dt) => {
	const alias = "publicos_sugeridos";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
	};
	const config = {
		tableName: "publicos_sugeridos",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "publico_sugerido_id"});
	};
	return entidad;
};
