module.exports = (sequelize, dt) => {
	const alias = "idiomas";
	const columns = {
		id: {type: dt.STRING(2), primaryKey: true},
		nombre: {type: dt.STRING(20)},
		masFrecuente: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_idiomas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
