module.exports = (sequelize, dt) => {
	const alias = "status_aprobacion";
	const columns = {
		nombre: { type: dt.STRING(10) },
	};
	const config = {
		tableName: "status_aprobacion",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "status_registro_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "status_aprobacion_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "status_aprobacion_id"});
		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "status_aprobacion_id"});
	};
	return entidad;
};
