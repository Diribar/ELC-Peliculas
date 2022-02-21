module.exports = (sequelize, dt) => {
	const alias = "links_prods";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},
		url: {type: dt.STRING(100)},
		link_tipo_id: {type: dt.INTEGER},
		link_prov_id: {type: dt.INTEGER},
		gratuito: {type: dt.BOOLEAN},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.INTEGER},
		status_registro_id: {type: dt.INTEGER},

		baja_sugerida_por_id: {type: dt.INTEGER},
		baja_sugerida_en: {type: dt.DATE},
		baja_analizada_por_id: {type: dt.INTEGER},
		baja_analizada_en: {type: dt.DATE},
		lead_time_baja: {type: dt.INTEGER},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "links_prods",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.peliculas, {as: "pelicula", foreignKey: "pelicula_id"});
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
		entidad.belongsTo(n.capitulos, {as: "capitulo", foreignKey: "capitulo_id"});
		entidad.belongsTo(n.links_tipos, {as: "link_tipo", foreignKey: "link_tipo_id"});
		entidad.belongsTo(n.links_provs, {as: "link_prov", foreignKey: "link_prov_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_analizada_por", foreignKey: "alta_analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "baja_sugerida_por", foreignKey: "baja_sugerida_por_id"});
		entidad.belongsTo(n.usuarios, {as: "baja_analizada_por", foreignKey: "baja_analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
		entidad.belongsTo(n.status_registro_prod, {as: "status_registro", foreignKey: "status_registro_id"});
	};
	return entidad;
};
