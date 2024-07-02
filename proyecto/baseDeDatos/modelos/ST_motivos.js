module.exports = (sequelize, dt) => {
	const alias = "motivosStatus";
	const columns = {
		orden: {type: dt.INTEGER},
		descripcion: {type: dt.STRING(33)},
		grupo: {type: dt.STRING(15)},
		codigo: {type: dt.STRING(15)},
		prods: {type: dt.BOOLEAN},
		rclvs: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		penalizac: {type: dt.DECIMAL},
		comentNeces: {type: dt.BOOLEAN},
		};
	const config = {
		tableName: "cam_status_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
