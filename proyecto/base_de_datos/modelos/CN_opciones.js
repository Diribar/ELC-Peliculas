module.exports = (sequelize, dt) => {
	const alias = "cn_opciones";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		codigo: {type: dt.STRING(20)},
		entDefault_id: {type: dt.BOOLEAN},
		cantidad: {type: dt.INTEGER},
		ascDes: {type: dt.STRING(6)},
		boton: {type: dt.INTEGER},
		loginNeces: {type: dt.BOOLEAN},
		caps: {type: dt.BOOLEAN},
		activo: {type: dt.BOOLEAN},
		ayuda: {type: dt.STRING(60)},
	};
	const config = {
		tableName: "1cn_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.cn_entsPorOpcion, {as: "entidades", foreignKey: "opcion_id"});
	};
	return entidad;
};
