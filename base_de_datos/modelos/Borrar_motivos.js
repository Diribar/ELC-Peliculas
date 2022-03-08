module.exports = (sequelize, dt) => {
	const alias = "borrar_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		prod: {type: dt.BOOLEAN},
		rclv: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		mensaje_mail: {type: dt.STRING(200)},
		};
	const config = {
		tableName: "borrar_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
