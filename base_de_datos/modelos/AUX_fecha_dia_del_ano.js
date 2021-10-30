module.exports = (sequelize, dt) => {
	const alias = "dia_del_ano";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		dia: { type: dt.INTEGER },
		mes_id: { type: dt.INTEGER },
	};
	const config = {
		tableName: "dia_del_ano ",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.mes, { as: "mes", foreignKey: "mes_id" });
	};
	return entidad;
};
