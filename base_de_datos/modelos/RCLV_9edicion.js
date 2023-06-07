module.exports = (sequelize, dt) => {
	const alias = "rclvs_edicion";
	const columns = {
		// Asociaciones
		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		tema_id: {type: dt.INTEGER},
		evento_id: {type: dt.INTEGER},
		epocaDelAno_id: {type: dt.INTEGER},

		// Comunes
		nombre: {type: dt.STRING(35)},
		diaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},

		// Común entre 'personajes' y 'hechos'
		ano: {type: dt.INTEGER},
		epoca_id: {type: dt.STRING(3)},

		// Específico de 'personajes'
		apodo: {type: dt.STRING(35)},
		sexo_id: {type: dt.STRING(1)},
		categoria_id: {type: dt.STRING(3)},
		apMar_id: {type: dt.INTEGER},
		canon_id: {type: dt.STRING(3)},
		rolIglesia_id: {type: dt.STRING(3)},

		// Específico de 'hechos'
		solo_cfc: {type: dt.BOOLEAN},
		ama: {type: dt.BOOLEAN},

		// Específico de 'epocas_del_ano'
		diasDeDuracion: {type: dt.INTEGER},
		comentarioDuracion: {type: dt.STRING(70)},
		carpetaAvatars: {type: dt.STRING(20)},

		// Fechas y Usuarios
		editadoPor_id: {type: dt.INTEGER},
		editadoEn: {type: dt.DATE},
	};
	const config = {
		tableName: "rclv_9edicion",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.temas, {as: "tema", foreignKey: "tema_id"});
		entidad.belongsTo(n.eventos, {as: "evento", foreignKey: "evento_id"});
		entidad.belongsTo(n.epocas_del_ano, {as: "epoca_del_ano", foreignKey: "epocaDelAno_id"});

		entidad.belongsTo(n.diasDelAno, {as: "diaDelAno", foreignKey: "diaDelAno_id"});

		entidad.belongsTo(n.sexos, {as: "sexo", foreignKey: "sexo_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.epocas, {as: "epoca", foreignKey: "epoca_id"});
		entidad.belongsTo(n.hechos, {as: "ap_mar", foreignKey: "apMar_id"});
		entidad.belongsTo(n.canons, {as: "canon", foreignKey: "canon_id"});
		entidad.belongsTo(n.roles_iglesia, {as: "rolIglesia", foreignKey: "rolIglesia_id"});

		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editadoPor_id"});
	};
	return entidad;
};
