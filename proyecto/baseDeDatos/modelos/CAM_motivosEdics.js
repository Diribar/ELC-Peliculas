module.exports = (sequelize, dt) => {
	const alias = "motivosEdics";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(40)},
		codigo: {type: dt.STRING(15)},
		avatar_prods: {type: dt.BOOLEAN},
		avatar_rclvs: {type: dt.BOOLEAN},
		avatar_us: {type: dt.BOOLEAN},
		prods: {type: dt.BOOLEAN},
		rclvs: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		rev_edicion: {type: dt.BOOLEAN},
		penalizac: {type: dt.DECIMAL},
	};
	const config = {
		tableName: "cam_motivos_edics",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
