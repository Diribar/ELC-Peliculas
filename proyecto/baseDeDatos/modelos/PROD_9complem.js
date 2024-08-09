module.exports = (sequelize, dt) => {
	const alias = "prodsComplem";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		grupoCol_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},

		azar: {type: dt.INTEGER}, // se puede por 'campo_id' y por 'entidad_id'

		// linksTrailer: {type: dt.INTEGER},
		// linksGral: {type: dt.INTEGER},
		// linksGratis: {type: dt.INTEGER},
		// linksCast: {type: dt.INTEGER},
		// linksSubt: {type: dt.INTEGER},
		// HD_Gral: {type: dt.INTEGER},
		// HD_Gratis: {type: dt.INTEGER},
		// HD_Cast: {type: dt.INTEGER},
		// HD_Subt: {type: dt.INTEGER},

		// feValores: {type: dt.INTEGER},
		// entretiene: {type: dt.INTEGER},
		// calidadTecnica: {type: dt.INTEGER},
		// calificacion: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_9complem",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
