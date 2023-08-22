module.exports = (sequelize, dt) => {
	const alias = "cn_ordenes";
	const columns = {
		nombre: {type: dt.STRING(40)},
		orden: {type: dt.INTEGER},
		codigo: {type: dt.STRING(20)},
		ascDes: {type: dt.STRING(6)},
		cuatroPelis: {type: dt.INTEGER},
	};
	const config = {
		tableName: "cn_ordenes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.cn_ordenesPorEnts, {as: "entidades", foreignKey: "orden_id"});
	};
	return entidad;
};
