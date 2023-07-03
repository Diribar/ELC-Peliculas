module.exports = (sequelize, dt) => {
	const alias = "int_opciones";
	const columns = {
		nombre: {type: dt.STRING(25)},
		laQuieroVer: {type: dt.BOOLEAN},
		yaLaVi: {type: dt.BOOLEAN},
		noMeInteresa: {type: dt.BOOLEAN},
		icono: {type: dt.STRING(25)},
	};
	const config = {
		tableName: "int_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
