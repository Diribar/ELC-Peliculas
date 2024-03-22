module.exports = (sequelize, dt) => {
	const alias = "novedadesELC";
	const columns = {
		comentario: {type: dt.STRING(60)},
		fecha: {type: dt.DATE},
		versionELC: {type: dt.STRING(4)},

		permInputs: {type: dt.BOOLEAN},
		autTablEnts:{type: dt.BOOLEAN},
		revisorPERL: {type: dt.BOOLEAN},
		revisorLinks: {type: dt.BOOLEAN},
		revisorEnts: {type: dt.BOOLEAN},
		revisorUs: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_novedades_elc",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
