module.exports = (sequelize, dt) => {
	const alias = "configsCons";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cn_config_cabecera",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.configsConsCampos, {as: "campos", foreignKey: "configCons_id"});
	};
	return entidad;
};
