module.exports = (sequelize, dt) => {
	const alias = "altas_motivos_rech";
	const columns = {
		orden: {type: dt.INTEGER},
		comentario: {type: dt.STRING(41)},
		prod: {type: dt.BOOLEAN},
		rclv: {type: dt.BOOLEAN},
		links: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		};
	const config = {
		tableName: "altas_motivos_rech",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	// entidad.associate = (n) => {
	// 	entidad.hasMany(n.links, {as: "linksRechazados", foreignKey: "motivo_id"}); 
	// };
	return entidad;
};
