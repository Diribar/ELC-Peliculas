module.exports = (sequelize, dt) => {
	const alias = "usuarios";
	const columns = {
		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},
		nombre: {type: dt.STRING(50)},
		apellido: {type: dt.STRING(50)},
		apodo: {type: dt.STRING(50)},
		avatar: {type: dt.STRING(100)},
		fecha_nacimiento: {type: dt.DATE},
		sexo_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		rol_iglesia_id: {type: dt.STRING(2)},
		rol_usuario_id: {type: dt.INTEGER},
		autorizado_fa: {type: dt.BOOLEAN},
		aut_data_entry: {type: dt.BOOLEAN},

		creado_en: {type: dt.DATE},
		completado_en: {type: dt.DATE},
		borrado_motivo_id: {type: dt.INTEGER},
		borrado_motivo_comentario: {type: dt.STRING(500)},
		status_registro_id: {type: dt.INTEGER},

		editado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "usuarios",
		createdAt: "creado_en",
		updatedAt: "editado_en",
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
		entidad.belongsTo(n.roles_usuarios, {as: "rol_usuario", foreignKey: "rol_usuario_id"});
		entidad.belongsTo(n.roles_iglesia, {as: "rol_iglesia", foreignKey: "rol_iglesia_id"});
		entidad.belongsTo(n.status_registro_usuario, {as: "status_registro", foreignKey: "status_registro_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "borrado_motivo", foreignKey: "borrado_motivo_id"});

		entidad.hasMany(n.us_calificaciones, {as: "calificaciones",foreignKey: "usuario_id"});
		entidad.hasMany(n.us_interes_en_prod, {as: "interes_en_prod",foreignKey: "usuario_id"});
	};
	return entidad;
};
