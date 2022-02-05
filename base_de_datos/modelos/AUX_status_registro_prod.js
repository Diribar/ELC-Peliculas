module.exports = (sequelize, dt) => {
	const alias = "status_registro_prod";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(25)},
		aprobada: {type: dt.BOOLEAN},
		borrada: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "status_registro_prod",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "status_registro_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "status_registro_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "status_registro_id"});
	};
	return entidad;
};
