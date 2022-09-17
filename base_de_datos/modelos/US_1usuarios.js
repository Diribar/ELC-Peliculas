module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},
		nombre: {type: dt.STRING(30)},
		apellido: {type: dt.STRING(30)},
		apodo: {type: dt.STRING(30)},
		avatar: {type: dt.STRING(100)},
		fecha_nacimiento: {type: dt.DATE},
		sexo_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		rol_iglesia_id: {type: dt.STRING(3)},
		rol_usuario_id: {type: dt.INTEGER},
		bloqueo_perm_inputs: {type: dt.BOOLEAN},
		autorizado_fa: {type: dt.BOOLEAN},
		docum_numero: {type: dt.STRING(15)},
		docum_pais_id: {type: dt.STRING(2)},
		docum_avatar: {type: dt.STRING(18)},

		dias_login: {type: dt.INTEGER},
		version_elc_ultimo_login: {type: dt.STRING(4)},

		fecha_ultimo_login: {type: dt.DATE},
		fecha_contrasena: {type: dt.DATE},
		fecha_revisores: {type: dt.DATE},

		creado_en: {type: dt.DATE},
		completado_en: {type: dt.DATE},
		editado_en: {type: dt.DATE},

		prods_aprob: {type: dt.INTEGER},
		prods_rech: {type: dt.INTEGER},
		rclvs_aprob: {type: dt.INTEGER},
		rclvs_rech: {type: dt.INTEGER},
		links_aprob: {type: dt.INTEGER},
		links_rech: {type: dt.INTEGER},
		edics_aprob: {type: dt.INTEGER},
		edics_rech: {type: dt.INTEGER},

		penalizac_acum: {type: dt.DECIMAL},
		penalizado_en: {type: dt.DATE},
		penalizado_hasta: {type: dt.DATE},

		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
		captura_activa: {type: dt.BOOLEAN},

		status_registro_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "usuarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
		entidad.belongsTo(n.roles_usuarios, {as: "rol_usuario", foreignKey: "rol_usuario_id"});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});
		entidad.belongsTo(n.status_registro_us, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.paises, {as: "docum_pais", foreignKey: "docum_pais_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "creado_por_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "creado_por_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "creado_por_id"});
		
		entidad.hasMany(n.peliculas, {as: "captura_peliculas", foreignKey: "capturado_por_id"});
		entidad.hasMany(n.colecciones, {as: "captura_colecciones", foreignKey: "capturado_por_id"});
		entidad.hasMany(n.capitulos, {as: "captura_capitulos", foreignKey: "capturado_por_id"});
		entidad.hasMany(n.personajes, {as: "captura_personajes", foreignKey: "capturado_por_id"});
		entidad.hasMany(n.hechos, {as: "captura_hechos", foreignKey: "capturado_por_id"});
		entidad.hasMany(n.valores, {as: "captura_valores", foreignKey: "capturado_por_id"});

		entidad.hasMany(n.cal_registros, {as: "calificaciones", foreignKey: "usuario_id"});
		entidad.hasMany(n.interes_en_prod, {as: "interes_en_prod", foreignKey: "usuario_id"});

		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
	};
	return entidad;
};
