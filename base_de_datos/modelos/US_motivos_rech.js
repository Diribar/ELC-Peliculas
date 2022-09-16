module.exports = (sequelize, dt) => {
	const alias = "us_motivos_rech";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(42)},
		duracion: {type: dt.DECIMAL},
		bloqueo_perm_inputs: {type: dt.BOOLEAN},
		mostrar_para_docum: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_motivos_rech",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
