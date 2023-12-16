module.exports = (sequelize, dt) => {
	const alias = "cn_opciones";
	const columns = {
		nombre: {type: dt.STRING(40)},
		codigo: {type: dt.STRING(20)},
		ascDes: {type: dt.STRING(6)},
		loginNeces: {type: dt.BOOLEAN},
		quitaNoMeInteresa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.cn_opcionesPorEnt, {as: "entidades", foreignKey: "opcion_id"});
	};
	return entidad;
};
