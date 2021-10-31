module.exports = (sequelize, dt) => {
	const alias = "historicos_personajes";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		dia_del_ano_id: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
		status_canonizacion_id: { type: dt.INTEGER },
		breve_descripcion_id: { type: dt.INTEGER },
		cant_productos: { type: dt.INTEGER },
		creada_por_id: { type: dt.INTEGER },
		creada_en: { type: dt.DATE },
		editada_por_id: { type: dt.INTEGER },
		editada_en: { type: dt.DATE },
		revisada_por_id: { type: dt.INTEGER },
		revisada_en: { type: dt.DATE },
		cant_ediciones: { type: dt.INTEGER },
		aprobada: { type: dt.BOOLEAN },
		borrada: { type: dt.BOOLEAN },
		borrada_por_id: { type: dt.INTEGER },
		borrada_en: { type: dt.DATE },
		borrada_motivo_id: { type: dt.INTEGER },
		borrada_motivo_comentario: { type: dt.STRING(500) },
	};
	const config = {
		tableName: "historicos_personajes",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.dias_del_ano, {as: "fecha", foreignKey: "dia_del_ano_id"});
		entidad.belongsTo(n.status_canonizacion, {as: "status_canonizacion", foreignKey: "status_canonizacion_id"});
		entidad.belongsTo(n.breve_descripcion, {as: "breve_descripcion", foreignKey: "breve_descripcion_id"});
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "borrada_por", foreignKey: "borrada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "personaje_historico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones",foreignKey: "personaje_historico_id"});
	};
	return entidad;
};
