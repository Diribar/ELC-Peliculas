module.exports = (sequelize, dt) => {
	const alias = "Inactivar_recuperar";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},

		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},

		link_id: {type: dt.INTEGER},

		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},
		analizado_por_id: {type: dt.INTEGER},
		analizado_en: {type: dt.DATE},
		motivo_id: {type: dt.INTEGER},

		status_registro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "historial_inactivar_recuperar",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});

		entidad.belongsTo(n.RCLV_personaje, {as: "personajes", foreignKey: "personaje_id"});
		entidad.belongsTo(n.RCLV_hecho, {as: "hechos", foreignKey: "hecho_id"});
		entidad.belongsTo(n.RCLV_valor, {as: "valores", foreignKey: "valor_id"});

		entidad.belongsTo(n.links_originales, {as: "link_original", foreignKey: "link_id"});

		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizado_por", foreignKey: "analizado_por_id"});

		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
	}
	return entidad;
};
