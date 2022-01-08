module.exports = (sequelize, dt) => {
	const alias = "penalizaciones_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		alta: {type: dt.BOOLEAN},
		edicion: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		mensaje_mail: {type: dt.STRING(200)},
	};
	const config = {
		tableName: "penalizaciones_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.penalizaciones_usuarios, {as: "penalizaciones_usuarios", foreignKey: "penalizacion_id"});
		entidad.hasMany(n.PROD_borrado_motivos, {as: "motivos_borrado_PROD", foreignKey: "penalizacion_id"});
		entidad.hasMany(n.RCLV_borrado_motivos, {as: "motivos_borrado_RCLV", foreignKey: "penalizacion_id"});
	};
	return entidad;
};
