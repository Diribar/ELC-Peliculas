module.exports = (sequelize, dt) => {
	const alias = "dias_edicion";
	const columns = {
		dia: {type: dt.INTEGER},
		dia_del_ano_id: {type: dt.INTEGER},
		epoca_del_ano_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_dias_del_ano",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});
		entidad.belongsTo(n.epocas_del_ano, {as: "epoca_del_ano", foreignKey: "epoca_del_ano_id"});
	};
	return entidad;
};
