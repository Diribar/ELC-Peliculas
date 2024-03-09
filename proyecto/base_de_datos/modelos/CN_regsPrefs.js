module.exports = (sequelize, dt) => {
	const alias = "consRegsPrefs";
	const columns = {
		cabecera_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(20)},
		valor: {type: dt.STRING(15)},
	};
	const config = {
		tableName: "cn_regs_prefs",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.consRegsCabecera, {as: "regCabecera", foreignKey: "cabecera_id"});
	};
	return entidad;
};
