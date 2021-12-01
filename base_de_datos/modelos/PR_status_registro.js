module.exports = (sequelize, dt) => {
	const alias = "status_registro_producto";
	const columns = {
		nombre: { type: dt.STRING(10) },
	};
	const config = {
		tableName: "status_registro_producto",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "status_registro_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "status_registro_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "status_registro_id"});
		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "status_registro_id"});
	};
	return entidad;
};
