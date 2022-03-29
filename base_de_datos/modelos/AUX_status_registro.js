module.exports = (sequelize, dt) => {
	const alias = "status_registro";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(25)},
		gr_pend_aprob: {type: dt.BOOLEAN},
		gr_aprobados: {type: dt.BOOLEAN},
		gr_revisados: {type: dt.BOOLEAN},
		gr_inactivos: {type: dt.BOOLEAN},
		creado: {type: dt.BOOLEAN},
		alta_aprob: {type: dt.BOOLEAN},
		aprobado: {type: dt.BOOLEAN},
		editado: {type: dt.BOOLEAN},
		inactivar: {type: dt.BOOLEAN},
		recuperar: {type: dt.BOOLEAN},
		inactivado: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_status_registro",
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
