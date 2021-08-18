module.exports = (sequelize, dt) => {
    const alias = "usuarios";
    const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		email: { type: dt.STRING(100) },
		contrasena: { type: dt.STRING(50) },
		status_registro_usuario_id: { type: dt.INTEGER },
		rol_usuario_id: { type: dt.INTEGER },
		autorizado_fa: { type: dt.BOOLEAN },
		nombre: { type: dt.STRING(50) },
		apellido: { type: dt.STRING(50) },
		apodo: { type: dt.STRING(50) },
		avatar: { type: dt.STRING(100) },
		fecha_nacimiento: { type: dt.DATE },
		sexo_id: { type: dt.STRING(1) },
		pais_id: { type: dt.STRING(2) },
		estado_eclesial_id: { type: dt.STRING(2) },
		completado_en: { type: dt.DATE },
		autorizado_data_entry: { type: dt.BOOLEAN },
		borrado: { type: dt.BOOLEAN },
		borrado_en: { type: dt.DATE },
		borrado_motivo: { type: dt.STRING(500) },
		borrado_por: { type: dt.INTEGER },
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
        entidad.belongsTo(n.status_registro_usuarios, {as: "status_registro_usuario", foreignKey: "status_registro_usuario_id"});
        entidad.belongsTo(n.estados_eclesiales, {as: "estado_eclesial", foreignKey: "estado_eclesial_id"});

		entidad.hasMany(n.us_pel_calificaciones, {as: "us_pel_calificaciones",foreignKey: "usuario_id"});
		entidad.hasMany(n.us_pel_interes, {as: "us_pel_interes",foreignKey: "usuario_id"});

    };
    return entidad;
}; 