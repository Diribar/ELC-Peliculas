module.exports = (sequelize, dt) => {
	const alias = "borrar_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		penaliz_asoc_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "borrar_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
