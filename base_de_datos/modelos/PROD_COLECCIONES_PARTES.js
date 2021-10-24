module.exports = (sequelize, dt) => {
	const alias = "colecciones_partes";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		colec_id: { type: dt.INTEGER },
		peli_id: { type: dt.INTEGER },
		peli_tmdb_id: { type: dt.STRING(20) },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
		orden: { type: dt.INTEGER },
		calificacion: { type: dt.INTEGER },
		creada_por_id: { type: dt.INTEGER },
		creada_en: { type: dt.DATE },
		analizada_por_id: { type: dt.INTEGER },
		analizada_en: { type: dt.DATE },
		aprobada: { type: dt.BOOLEAN },
		fechaFIFO: { type: dt.DATE },
		editada_por_id: { type: dt.INTEGER },
		editada_en: { type: dt.DATE },
		revisada_por_id: { type: dt.INTEGER },
		revisada_en: { type: dt.DATE },
		borrada: { type: dt.BOOLEAN },
		borrada_por_id: { type: dt.INTEGER },
		borrada_en: { type: dt.DATE },
		borrada_motivo_id: { type: dt.INTEGER },
		borrada_motivo_comentario: { type: dt.STRING(500) },
	};
	const config = {
		tableName: "colecciones_partes",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "colec_id"});
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "borrada_por", foreignKey: "borrada_por_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrada_motivo", foreignKey: "borrada_motivo_id"});
	};
	return entidad;
};
