module.exports = (sequelize, dt) => {
	const alias = "PROD_borrados_col";
	const columns = {
		prod_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "PROD_borrados_col",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.colecciones, {as: "producto", foreignKey: "prod_id"});
		entidad.belongsTo(n.PROD_borrar_motivos, {as: "motivo", foreignKey: "motivo_id"});
	};
	return entidad;
};
