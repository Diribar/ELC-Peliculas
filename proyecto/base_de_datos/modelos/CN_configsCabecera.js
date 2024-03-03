module.exports = (sequelize, dt) => {
	const alias = "consRegsCabecera";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		creadoEn: {type: dt.DATE},
		activo: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_regs_cabecera",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.configsConsCampos, {as: "campos", foreignKey: "configCons_id"});
	};
	return entidad;
};
