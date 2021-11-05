module.exports = (sequelize, dt) => {
    const alias = "usuarios";
    const columns = {
		email: { type: dt.STRING(100) },
		contrasena: { type: dt.STRING(50) },
		status_registro_id: { type: dt.INTEGER },
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
		creado_en: { type: dt.DATE },
		completado_en: { type: dt.DATE },
		editado_en: { type: dt.DATE },
		aut_data_entry: { type: dt.BOOLEAN },
		borrado: { type: dt.BOOLEAN },
		borrado_en: { type: dt.DATE },
		borrado_motivo: { type: dt.STRING(500) },
		borrado_por_id: { type: dt.INTEGER },
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
        entidad.belongsTo(n.status_registro, {as: "status_registro", foreignKey: "status_registro_id"});
        entidad.belongsTo(n.estados_eclesiales, {as: "estado_eclesial", foreignKey: "estado_eclesial_id"});
        entidad.belongsTo(n.usuarios, {as: "borrado_por", foreignKey: "borrado_por_id"});
		entidad.hasMany(n.calificaciones_us, {as: "calificaciones",foreignKey: "usuario_id"});
		entidad.hasMany(n.interes_en_prod_us, {as: "interes_en_prod",foreignKey: "usuario_id"});
    };
    return entidad;
}; 