module.exports = (sequelize, dt) => {
	const alias = "motivos_rech_docum";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(42)},
		duracion: {type: dt.DECIMAL},
		bloqueo_perm_inputs :{type: dt.BOOLEAN},
		status_id:{type: dt.INTEGER},
	};
	const config = {
		tableName: "us_motivos_rech_docum",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
