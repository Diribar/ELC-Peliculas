module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},
		nombre: {type: dt.STRING(30)},
		apellido: {type: dt.STRING(30)},
		apodo: {type: dt.STRING(30)},
		numero_documento: {type: dt.INTEGER},
		avatar: {type: dt.STRING(100)},
		fecha_nacimiento: {type: dt.DATE},
		sexo_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		rol_iglesia_id: {type: dt.STRING(3)},
		rol_usuario_id: {type: dt.INTEGER},
		autorizado_fa: {type: dt.BOOLEAN},

		dias_login: {type: dt.INTEGER},
		fecha_ultimo_login: {type: dt.DATE},
	
		creado_en: {type: dt.DATE},
		completado_en: {type: dt.DATE},
		editado_en: {type: dt.DATE},
		status_registro_id: {type: dt.INTEGER},

		motivo_penalizac_id: {type: dt.INTEGER},
		penalizado_hasta: {type: dt.DATE},
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
		entidad.belongsTo(n.motivos_para_borrar, {as: "motivo_penalizac", foreignKey: "motivo_penalizac_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "creado_por_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones",foreignKey: "creado_por_id"});

		entidad.hasMany(n.cal_registros, {as: "calificaciones",foreignKey: "usuario_id"});
		entidad.hasMany(n.interes_en_prod, {as: "interes_en_prod",foreignKey: "usuario_id"});

		entidad.hasMany(n.registros_borrados, {as: "registros_borrados",foreignKey: "usuario_implicado_id"});
	};
	return entidad;
};
