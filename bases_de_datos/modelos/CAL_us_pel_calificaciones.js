module.exports = (sequelize, dt) => {
	const alias = "us_pel_calificaciones";
	const columns  = {
		id: {type: dt.INTEGER, primaryKey: true},
		usuario_id: {type: dt.INTEGER},
		pelicula_id: {type: dt.INTEGER},
		fe_valores_id: {type: dt.INTEGER},
		entretiene_id: {type: dt.INTEGER},
		calidad_filmica_id: {type: dt.INTEGER},
		resultado: {type: dt.INTEGER},
	}
	const config = {
		tableName: "us_pel_calificaciones",
		timestamps: false
	}
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = n => {
		entidad.belongsTo(n.calidad_filmica, {as: "calidad_filmica", foreignKey: "calidad_filmica_id"});
		entidad.belongsTo(n.fe_valores, {as: "fe_valores", foreignKey: "fe_valores_id"});
		entidad.belongsTo(n.entretiene, {as: "entretiene", foreignKey: "entretiene_id"});
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
	};
	return entidad;
}