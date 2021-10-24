module.exports = (sequelize, dt) => {
	const alias = "hechos_historicos";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		dia_del_ano: { type: dt.INTEGER },
		dia: { type: dt.INTEGER },
		mes: { type: dt.INTEGER },
		nombre: { type: dt.STRING(20) },
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
		tableName: "hechos_historicos",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "borrada_por", foreignKey: "borrada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id"});
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "hecho_historico_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones",foreignKey: "personaje_historico_id"});
	};
	return entidad;
};
