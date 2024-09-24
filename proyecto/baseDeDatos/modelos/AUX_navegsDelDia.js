module.exports = (sequelize, dt) => {
	const alias = "navegsDelDia";
	const columns = {
		fecha: {type: dt.STRING(10)},
		usuario_id: {type: dt.INTEGER},
		cliente_id: {type: dt.STRING(11)},
		diasNaveg: {type: dt.INTEGER}, // para la estadística
		visitaCreadaEn: {type: dt.STRING(10)}, // para la estadística
	};
	const config = {
		tableName: "aux_navegs_del_dia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
