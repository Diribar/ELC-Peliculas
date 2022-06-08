module.exports = (sequelize, dt) => {
	const alias = "status_registro";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(25)},
		gr_pend_aprob: {type: dt.BOOLEAN},
		gr_estables: {type: dt.BOOLEAN},
		gr_provisorios: {type: dt.BOOLEAN},
		gr_inactivos: {type: dt.BOOLEAN},
		creado: {type: dt.BOOLEAN},
		alta_aprob: {type: dt.BOOLEAN},
		aprobado: {type: dt.BOOLEAN},
		inactivar: {type: dt.BOOLEAN},
		inactivo: {type: dt.BOOLEAN},
		recuperar: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_status_registro",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
