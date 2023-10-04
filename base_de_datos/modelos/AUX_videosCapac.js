module.exports = (sequelize, dt) => {
	const alias = "videosCapac";
	const columns = {
		orden: {type: dt.INTEGER},
		titulo: {type: dt.STRING(30)},
		codigo: {type: dt.STRING(20)},
		icono: {type: dt.STRING(25)},

		hr: {type: dt.BOOLEAN},
		permInputs: {type: dt.BOOLEAN},
		revisorPERL: {type: dt.BOOLEAN},
		revisorLinks: {type: dt.BOOLEAN},
		revisorEnts: {type: dt.BOOLEAN},
		revisorUs: {type: dt.BOOLEAN},
		actualizado: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_videos_capac",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
