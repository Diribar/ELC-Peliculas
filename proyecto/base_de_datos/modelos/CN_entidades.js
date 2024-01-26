module.exports = (sequelize, dt) => {
	const alias = "cn_entidades";
	const columns = {
		nombre: {type: dt.STRING(40)},
		orden: {type: dt.INTEGER},
		codigo: {type: dt.STRING(20)},
		bhrSeguro: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_entidades",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.cn_entsPorOpcion, {as: "opciones", foreignKey: "entidad_id"});
	};
	return entidad;
};
