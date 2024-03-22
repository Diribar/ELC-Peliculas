module.exports = (sequelize, dt) => {
	const alias = "calRegistros";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},
		feValores_id: {type: dt.INTEGER},
		entretiene_id: {type: dt.INTEGER},
		calidadTecnica_id: {type: dt.INTEGER},
		resultado: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "cal_registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
		entidad.belongsTo(n.feValores, {as: "feValores", foreignKey: "feValores_id"});
		entidad.belongsTo(n.entretiene, {as: "entretiene", foreignKey: "entretiene_id"});
		entidad.belongsTo(n.calidadTecnica, {as: "calidadTecnica", foreignKey: "calidadTecnica_id"});
	};
	return entidad;
};
