module.exports = (sequelize, dt) => {
	const alias = "clientesDelDia";
	const columns = {
		fecha: {type: dt.STRING(10)},
		usuario_id: {type: dt.INTEGER},
		cliente_id: {type: dt.STRING(11)},
		diasNaveg: {type: dt.INTEGER},
		visitaCreadaEn: {type: dt.DATE},
	};
	const config = {
		tableName: "aux_clientes_del_dia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
