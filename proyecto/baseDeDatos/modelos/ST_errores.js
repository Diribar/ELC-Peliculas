module.exports = (sequelize, dt) => {
	const alias = "statusErrores";
	const columns = {
		// Datos del registro
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(35)},
		fechaRef: {type: dt.DATE},

		// Anomalía
		ST: {type: dt.BOOLEAN},
		IN: {type: dt.BOOLEAN},
		RC: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "st_errores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
