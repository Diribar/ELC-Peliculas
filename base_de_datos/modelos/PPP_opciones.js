module.exports = (sequelize, dt) => {
	const alias = "pppOpciones";
	const columns = {
		nombre: {type: dt.STRING(25)},
		laQuieroVer: {type: dt.BOOLEAN},
		yaLaVi: {type: dt.BOOLEAN},
		noMeInteresa: {type: dt.BOOLEAN},
		icono: {type: dt.STRING(25)},
	};
	const config = {
		tableName: "ppp_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
