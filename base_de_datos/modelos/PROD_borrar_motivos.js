module.exports = (sequelize, dt) => {
	const alias = "PROD_borrar_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		penaliz_asoc_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "PROD_borrar_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.penaliz_us_motivos, {as: "penaliz_asociada", foreignKey: "penaliz_asoc_id"});
	};
	return entidad;
};
