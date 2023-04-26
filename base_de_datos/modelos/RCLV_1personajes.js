module.exports = (sequelize, dt) => {
	const alias = "personajes";
	const columns = {
		// Común con todos los RCLVs
		nombre: {type: dt.STRING(30)},
		prods_aprob: {type: dt.INTEGER},
		dia_del_ano_id: {type: dt.INTEGER},
		fecha_movil: {type: dt.BOOLEAN},
		comentario_movil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Común con hechos
		ano: {type: dt.INTEGER},
		epoca_id: {type: dt.STRING(3)},

		// Específicos
		apodo: {type: dt.STRING(30)},
		sexo_id: {type: dt.STRING(1)},
		categoria_id: {type: dt.STRING(3)},
		rol_iglesia_id: {type: dt.STRING(3)},
		canon_id: {type: dt.STRING(3)},
		ap_mar_id: {type: dt.INTEGER},

		// Común con todos los RCLVs
		creado_por_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		alta_revisada_por_id: {type: dt.INTEGER},
		alta_revisada_en: {type: dt.DATE},
		lead_time_creacion: {type: dt.DECIMAL},

		// Fechas y Usuarios
		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		edic_revisada_por_id: {type: dt.INTEGER},
		edic_revisada_en: {type: dt.DATE},
		lead_time_edicion: {type: dt.DECIMAL},

		sugerido_por_id: {type: dt.INTEGER},
		sugerido_en: {type: dt.DATE},
		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},

		status_registro_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_1personajes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});
		entidad.belongsTo(n.epocas, {as: "epoca", foreignKey: "epoca_id"});

		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});
		entidad.belongsTo(n.canons, {as: "canon", foreignKey: "canon_id"});
		entidad.belongsTo(n.hechos, {as: "ap_mar", foreignKey: "ap_mar_id"});

		entidad.belongsTo(n.usuarios, {as: "creado_por", foreignKey: "creado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "alta_revisada_por", foreignKey: "alta_revisada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "edic_revisada_por", foreignKey: "edic_revisada_por_id"});

		entidad.belongsTo(n.status_registros, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.motivos_rech_altas, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.usuarios, {as: "sugerido_por", foreignKey: "sugerido_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "personaje_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "personaje_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "personaje_id"});
		entidad.hasMany(n.prods_edicion, {as: "prods_edicion", foreignKey: "personaje_id"});

		entidad.hasMany(n.rclvs_edicion, {as: "ediciones", foreignKey: "personaje_id"});
	};
	return entidad;
};
