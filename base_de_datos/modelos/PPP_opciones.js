module.exports = (sequelize, dt) => {
	const alias = "pppOpciones";
	const columns = {
		nombre: {type: dt.STRING(25)},
		yaLaVi: {type: dt.BOOLEAN},
		sinPreferencia: {type: dt.BOOLEAN},
		icono: {type: dt.STRING(30)},
	};
	const config = {
		tableName: "ppp_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
