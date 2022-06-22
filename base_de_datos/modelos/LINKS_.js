module.exports = (sequelize, dt) => {
	const alias = "links";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},

		url: {type: dt.STRING(100)},
		prov_id: {type: dt.INTEGER},

		calidad: {type: dt.INTEGER},
		castellano: {type: dt.BOOLEAN},
		gratuito: {type: dt.BOOLEAN},
		tipo_id: {type: dt.INTEGER},
		completo: {type: dt.INTEGER},
		parte: {type: dt.INTEGER},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_analizada_por_id: {type: dt.INTEGER},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},
	};
	const config = {
		tableName: "links",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});
		entidad.belongsTo(n.links_tipos, {as: "tipo", foreignKey: "tipo_id"});
		entidad.belongsTo(n.links_provs, {as: "prov", foreignKey: "prov_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_analizada_por", foreignKey: "alta_analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_analizada_por", foreignKey: "edic_analizada_por_id"});

		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});

		entidad.hasMany(n.historial_cambios_de_status, {as: "historial", foreignKey: "link_id"});
		entidad.hasMany(n.links_edicion, {as: "ediciones", foreignKey: "link_id"});
	};
	return entidad;
};
