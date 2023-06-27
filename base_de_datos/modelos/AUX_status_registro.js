module.exports = (sequelize, dt) => {
	const alias = "statusRegistros";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(25)},
		gr_creado: {type: dt.BOOLEAN},
		gr_aprobado: {type: dt.BOOLEAN},
		gr_estables: {type: dt.BOOLEAN},
		gr_provisorios: {type: dt.BOOLEAN},
		gr_pasivos: {type: dt.BOOLEAN},
		gr_inactivos: {type: dt.BOOLEAN},
		
		creado: {type: dt.BOOLEAN},
		creadoAprob: {type: dt.BOOLEAN},
		aprobado: {type: dt.BOOLEAN},
		inactivar: {type: dt.BOOLEAN},
		inactivo: {type: dt.BOOLEAN},
		recuperar: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_status_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
