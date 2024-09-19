module.exports = (sequelize, dt) => {
	const alias = "clientesDelDia";
	const columns = {
		fecha: {type: dt.STRING(10)},
		usuario_id: {type: dt.INTEGER},
		visita_id: {type: dt.STRING(11)},
	};
	const config = {
		tableName: "aux_logins_del_dia",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
