module.exports = (sequelize, dt) => {
	const alias = "pppOpciones";
	const columns = {
		nombre: {type: dt.STRING(25)},
		sinPreferencia: {type: dt.BOOLEAN},
		icono: {type: dt.STRING(25)},
	};
	const config = {
		tableName: "ppp_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
