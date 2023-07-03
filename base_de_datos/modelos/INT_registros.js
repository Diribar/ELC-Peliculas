module.exports = (sequelize, dt) => {
	const alias = "int_registros";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		opcion_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "int_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.int_opciones, {as: "detalle", foreignKey: "opcion_id"});
	};
	return entidad;
};
