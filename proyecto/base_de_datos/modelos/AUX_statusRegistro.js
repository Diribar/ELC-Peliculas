module.exports = (sequelize, dt) => {
	const alias = "statusRegistros";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(25)},
		codigo: {type: dt.STRING(15)},
	};
	const config = {
		tableName: "aux_status_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
