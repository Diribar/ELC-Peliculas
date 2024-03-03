module.exports = (sequelize, dt) => {
	const alias = "pppRegistros";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		ppp_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "ppp_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.pppOpciones, {as: "detalle", foreignKey: "ppp_id"});
	};
	return entidad;
};
