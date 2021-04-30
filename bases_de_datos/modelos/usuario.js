module.exports = (sequelize, dt) => {
    const alias = "usuario";
    const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(50)}
	};
    const config = {
        tableName: "usuarios",
        createdAt: 'creado_en',
        updatedAt: 'editado_en'
    };

    const usuario = sequelize.define(alias,columns,config);

    usuario.associate = n => {
        usuario.belongsTo(n.pais, {as: "pais", foreignKey: "pais_id"});
        usuario.belongsTo(n.rol_usuario, {as: "rol_usuario", foreignKey: "rol_usuario_id"});
        usuario.belongsTo(n.status_usuario, {as: "status_usuario", foreignKey: "status_usuario_id"});
    };

    return usuario;
}; 