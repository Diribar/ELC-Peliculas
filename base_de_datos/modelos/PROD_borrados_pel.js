module.exports = (sequelize, dt) => {
	const alias = "PROD_borrados_pel";
	const columns = {
		prod_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "PROD_borrados_pel",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "producto", foreignKey: "prod_id"});
		entidad.belongsTo(n.PROD_borrar_motivos, {as: "motivo", foreignKey: "motivo_id"});
	};
	return entidad;
};
