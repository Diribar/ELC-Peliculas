module.exports = (sequelize, dt) => {
	const alias = "personajes";
	const columns = {
		nombre: {type: dt.STRING(30)},
		dia_del_ano_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
		perenne: {type: dt.BOOLEAN},

		categoria_id: {type: dt.STRING(3)},
		subcategoria_id: {type: dt.STRING(3)},
		ap_mar_id: {type: dt.INTEGER},

		proceso_id: {type: dt.STRING(3)},
		rol_iglesia_id: {type: dt.STRING(3)},

		prod_aprob: {type: dt.BOOLEAN},

		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_analizada_por_id: {type: dt.INTEGER},
		edic_analizada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "rclv_1personajes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.subcategorias, {as: "subcategoria", foreignKey: "subcategoria_id"});
		entidad.belongsTo(n.hechos, {as: "ap_mar", foreignKey: "ap_mar_id"});
		entidad.belongsTo(n.procesos_canonizacion, {as: "proceso_canonizacion",	foreignKey: "proceso_id",});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_analizada_por", foreignKey: "edic_analizada_por_id"});

		entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.altas_motivos_rech, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "personaje_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "personaje_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "personaje_id"});

		entidad.hasMany(n.prods_edicion, {as: "ediciones_producto", foreignKey: "personaje_id"});

		entidad.hasMany(n.historial_cambios_de_status, {as: "historial", foreignKey: "personaje_id"});
		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "personaje_id"});
	};
	return entidad;
};
