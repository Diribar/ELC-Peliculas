module.exports = (sequelize, dt) => {
	const alias = "diarioNavegs";
	const columns = {
		cliente_id: {type: dt.STRING(11)},
		usuario_id: {type: dt.INTEGER},
		fecha: {type: dt.STRING(10)},
		visitaCreadaEn: {type: dt.STRING(10)}, // para la estadística
		diasNaveg: {type: dt.INTEGER}, // para la estadística
	};
	const config = {
		tableName: "ind_diario_navegs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
