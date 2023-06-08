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
		subtitulos: {type: dt.BOOLEAN},
		gratuito: {type: dt.BOOLEAN},
		tipo_id: {type: dt.INTEGER},
		completo: {type: dt.INTEGER},
		parte: {type: dt.INTEGER},

		creadoPor_id: {type: dt.INTEGER},
		creadoEn: {type: dt.DATE},
		altaRevisadaPor_id: {type: dt.INTEGER},
		altaRevisadaEn: {type: dt.DATE},
		leadTimeCreacion: {type: dt.DECIMAL},

		editadoPor_id: {type: dt.INTEGER},
		editadoEn: {type: dt.DATE},
		edicRevisadaPor_id: {type: dt.INTEGER},
		edicRevisadaEn: {type: dt.DATE},
		leadTimeEdicion: {type: dt.DECIMAL},

		vigenciaRevisadaEn: {type: dt.DATE},
		statusRegistro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugeridoPor_id: {type: dt.INTEGER},
		sugeridoEn: {type: dt.DATE},
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

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "altaRevisadaPor_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editadoPor_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edicRevisadaPor_id"});

		entidad.belongsTo(n.status_registros, {as: "statusRegistro", foreignKey: "statusRegistro_id"});
		entidad.belongsTo(n.motivosStatus, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugeridoPor_id"});

		entidad.hasMany(n.links_edicion, {as: "ediciones", foreignKey: "link_id"});
	};
	return entidad;
};
