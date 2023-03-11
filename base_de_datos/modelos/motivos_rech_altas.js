module.exports = (sequelize, dt) => {
	const alias = "motivos_rech_altas";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(41)},
		bloqueoInput: {type: dt.BOOLEAN},
		prods: {type: dt.BOOLEAN},
		rclvs: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		duracion: {type: dt.DECIMAL},
		req_com: {type: dt.BOOLEAN},
		};
	const config = {
		tableName: "motivos_rech_altas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
