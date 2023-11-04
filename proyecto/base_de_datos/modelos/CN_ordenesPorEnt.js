module.exports = (sequelize, dt) => {
	const alias = "cn_opcionesPorEnt";
	const columns = {
		entidad_id: {type: dt.INTEGER},
		opcion_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		boton: {type: dt.INTEGER},
		opcionDefault: {type: dt.BOOLEAN},
		activo: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "cn_opcs_por_ent",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.cn_entidades, {as: "entidad", foreignKey: "entidad_id"});
		entidad.belongsTo(n.cn_opciones, {as: "opcion", foreignKey: "opcion_id"});
	};
	return entidad;
};
