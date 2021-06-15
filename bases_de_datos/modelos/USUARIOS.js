module.exports = (sequelize, dt) => {
    const alias = "usuarios";
    const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		email: {type: dt.STRING(100)},
		contrasena: {type: dt.STRING(50)},
		status_usuario_id: {type: dt.INTEGER},
		rol_usuario_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		apellido: {type: dt.STRING(50)},
		apodo: {type: dt.STRING(50)},
		avatar: {type: dt.STRING(50)},
		fecha_nacimiento: {type: dt.DATE},
		sexo_id: {type: dt.STRING(1)},
		pais_id: {type: dt.STRING(2)},
		estado_eclesial_id: {type: dt.STRING(2)},
		completado_en: {type: dt.DATE},
		ultima_penalizacion_en: {type: dt.DATE},
		borrado_en: {type: dt.DATE},
		penalizaciones: {type: dt.INTEGER},
		ultima_penalizacion_en_rol_id: {type: dt.INTEGER},
		ultima_penalizacion_motivo: {type: dt.STRING(500)},
		penalizado_por: {type: dt.INTEGER},
		borrado: {type: dt.BOOLEAN},
		borrado_motivo: {type: dt.STRING(500)},
		borrado_por: {type: dt.INTEGER},
	};

	const config = {
        tableName: "usuarios",
        createdAt: 'creado_en',
        updatedAt: 'editado_en'
    };

    const entidad = sequelize.define(alias,columns,config);

    entidad.associate = n => {
        entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
        entidad.belongsTo(n.paises, {as: "pais", foreignKey: "pais_id"});
        entidad.belongsTo(n.roles_usuarios, {as: "rol_usuario", foreignKey: "rol_usuario_id"});
		entidad.belongsTo(n.roles_usuarios, {as: "ultima_penalizacion_en_rol", foreignKey: "ultima_penalizacion_en_rol_id"});
        entidad.belongsTo(n.status_usuarios, {as: "status_usuario", foreignKey: "status_usuario_id"});
        entidad.belongsTo(n.estados_eclesiales, {as: "estado_eclesial", foreignKey: "estado_eclesial_id"});

		entidad.hasMany(n.us_pel_calificaciones, {as: "us_pel_calificaciones",foreignKey: "usuario_id"});
		entidad.hasMany(n.us_pel_interes, {as: "us_pel_interes",foreignKey: "usuario_id"});

    };

    return entidad;
}; 