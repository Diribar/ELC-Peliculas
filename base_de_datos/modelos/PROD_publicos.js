module.exports = (sequelize, dt) => {
	const alias = "publicos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		mayores: {type: dt.INTEGER},
		familia: {type: dt.INTEGER},
		menores: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_publicos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "publico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "publico_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "publico_id"});
	};
	return entidad;
};
