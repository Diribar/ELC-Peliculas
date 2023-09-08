module.exports = (sequelize, dt) => {
	const alias = "statusRegistros";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(25)},
		codigo: {type: dt.STRING(15)},
		creados: {type: dt.BOOLEAN},
		aprobados: {type: dt.BOOLEAN},
		estables: {type: dt.BOOLEAN},
		provisorios: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_status_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
