module.exports = (sequelize, dt) => {
	const alias = "int_opciones";
	const columns = {
		nombre: {type: dt.STRING(20)},
		laQuieroVer: {type: dt.BOOLEAN},
		yaLaVi: {type: dt.BOOLEAN},
		noMeInteresa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "int_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
