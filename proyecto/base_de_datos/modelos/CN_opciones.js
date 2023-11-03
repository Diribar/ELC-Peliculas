module.exports = (sequelize, dt) => {
	const alias = "cn_opciones";
	const columns = {
		nombre: {type: dt.STRING(40)},
		codigo: {type: dt.STRING(20)},
		ascDes: {type: dt.STRING(6)},
	};
	const config = {
		tableName: "cn_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.cn_opcionesPorEnt, {as: "entidades", foreignKey: "orden_id"});
	};
	return entidad;
};
