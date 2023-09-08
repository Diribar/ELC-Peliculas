module.exports = (sequelize, dt) => {
	const alias = "motivosStatus";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(33)},
		codigo: {type: dt.STRING(15)},
		prods: {type: dt.BOOLEAN},
		rclvs: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		penalizac: {type: dt.DECIMAL},
		agregarComent: {type: dt.BOOLEAN},
		};
	const config = {
		tableName: "cam_motivos_status",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
