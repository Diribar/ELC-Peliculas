module.exports = (sequelize, dt) => {
	const alias = "dias_del_ano";
	const columns = {
		dia: {type: dt.INTEGER},
		mes_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_dias",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.meses, {as: "mes", foreignKey: "mes_id"});

		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.hechos, {as: "hechos", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.valores, {as: "valores", foreignKey: "dia_del_ano_id"});

	};
	return entidad;
};
