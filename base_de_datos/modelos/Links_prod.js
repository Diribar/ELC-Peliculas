module.exports = (sequelize, dt) => {
	const alias = "links_prod";
	const columns = {
		pelicula_id: {type: dt.INTEGER},
		coleccion_id: {type: dt.INTEGER},
		capitulo_id: {type: dt.INTEGER},
		url: {type: dt.STRING(100)},
		link_tipo_id: {type: dt.INTEGER},
		link_prov_id: {type: dt.INTEGER},
		gratuito: {type: dt.BOOLEAN},
		fecha_prov: {type: dt.DATE},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_analizada_por_id: {type: dt.INTEGER},
		alta_analizada_en: {type: dt.DATE},
		revisado_por_id: {type: dt.INTEGER},
		revisado_en: {type: dt.DATE},

	};
	const config = {
		tableName: "links_prod",
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
		entidad.belongsTo(n.usuarios, {as: "revisado_por", foreignKey: "revisado_por_id"});
		
	};
	return entidad;
};
