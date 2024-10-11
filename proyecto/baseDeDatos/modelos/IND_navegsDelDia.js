module.exports = (sequelize, dt) => {
	const alias = "navegsDelDia";
	const columns = {
		cliente_id: {type: dt.STRING(11)},
		usuario_id: {type: dt.INTEGER},
		fecha: {type: dt.STRING(10)},
		visitaCreadaEn: {type: dt.STRING(10)}, // para la estadística
		diasNaveg: {type: dt.INTEGER}, // para la estadística
	};
	const config = {
		tableName: "aux_navegs_del_dia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
