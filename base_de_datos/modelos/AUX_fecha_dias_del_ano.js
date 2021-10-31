module.exports = (sequelize, dt) => {
	const alias = "dias_del_ano";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		dia: { type: dt.INTEGER },
		mes_id: { type: dt.INTEGER },
	};
	const config = {
		tableName: "dias_del_ano",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.meses, { as: "mes", foreignKey: "mes_id" });
	};
	return entidad;
};
