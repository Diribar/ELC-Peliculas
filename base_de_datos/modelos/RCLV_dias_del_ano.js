module.exports = (sequelize, dt) => {
	const alias = "dias_del_ano";
	const columns = {
		dia: {type: dt.INTEGER},
		mes_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(6)},
		epoca_del_ano_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_dias_del_ano",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.meses, {as: "mes", foreignKey: "mes_id"});
		entidad.belongsTo(n.epocas_del_ano, {as: "epoca_del_ano", foreignKey: "epoca_del_ano_id"});

		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.hechos, {as: "hechos", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.temas, {as: "temas", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.eventos_del_ano, {as: "eventos_del_ano", foreignKey: "dia_del_ano_id"});
	};
	return entidad;
};
