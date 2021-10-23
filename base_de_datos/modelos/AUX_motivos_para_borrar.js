module.exports = (sequelize, dt) => {
	const alias = "motivos_para_borrar";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		nombre: { type: dt.STRING(20) },
		productos: { type: dt.BOOLEAN },
		personajes_historicos: { type: dt.BOOLEAN },
		hechos_historicos: { type: dt.BOOLEAN },
	};
	const config = {
		tableName: "motivos_para_borrar",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
