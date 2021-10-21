module.exports = (sequelize, dt) => {
	const alias = "colecciones_cabecera";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		colec_tmdb_id: { type: dt.STRING(10) },
		colec_fa_id: { type: dt.STRING(10) },
		colec_tmdb_rubro: { type: dt.STRING(10) },
		fuente: { type: dt.STRING(5) },
		partes_en_BD: { type: dt.BOOLEAN },
		nombre_original: { type: dt.STRING(100) },
		nombre_castellano: { type: dt.STRING(100) },
		ano_estreno: { type: dt.INTEGER },
		ano_fin: { type: dt.INTEGER },
		pais_id: { type: dt.STRING(20) },
		productor: { type: dt.STRING(50) },
		sinopsis: { type: dt.STRING(800) },
		avatar: { type: dt.STRING(100) },
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
		borrada_motivo: { type: dt.STRING(500) },
	};
	const config = {
		tableName: "colecciones_cabecera",
		timestamps: false,
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "analizada_por", foreignKey: "analizada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "revisada_por", foreignKey: "revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "borrada_por", foreignKey: "borrada_por_id"});
		entidad.hasMany(n.colecciones_partes, {as: "coleccion_partes",foreignKey: "coleccion_id"});
	};
	return entidad;
};
