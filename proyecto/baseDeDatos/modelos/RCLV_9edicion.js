module.exports = (sequelize, dt) => {
	const alias = "rclvsEdicion";
	const columns = {
		// Asociaciones
		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		tema_id: {type: dt.INTEGER},
		evento_id: {type: dt.INTEGER},
		epocaDelAno_id: {type: dt.INTEGER},

		// Comunes
		nombre: {type: dt.STRING(45)},
		fechaDelAno_id: {type: dt.INTEGER},
		fechaMovil: {type: dt.BOOLEAN},
		anoFM: {type: dt.INTEGER},
		comentarioMovil: {type: dt.STRING(70)},
		prioridad_id: {type: dt.INTEGER},
		avatar: {type: dt.STRING(15)},
		hoyEstamos: {type: dt.STRING(40)},
		leyNombre: {type: dt.STRING(70)},

		// Común entre 'personajes' y 'hechos'
		nombreAltern: {type: dt.STRING(35)},
		epocaOcurrencia_id: {type: dt.STRING(3)},

		// Específico de 'personajes'
		anoNacim: {type: dt.INTEGER},
		genero_id: {type: dt.STRING(1)},
		categoria_id: {type: dt.STRING(3)},
		apMar_id: {type: dt.INTEGER},
		canon_id: {type: dt.STRING(3)},
		rolIglesia_id: {type: dt.STRING(3)},

		// Específico de 'hechos'
		anoComienzo: {type: dt.INTEGER},
		soloCfc: {type: dt.BOOLEAN},
		ama: {type: dt.BOOLEAN},

		// Específico de 'epocasDelAno'
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
		entidad.belongsTo(n.epocasDelAno, {as: "epocaDelAno", foreignKey: "epocaDelAno_id"});

		entidad.belongsTo(n.fechasDelAno, {as: "fechaDelAno", foreignKey: "fechaDelAno_id"});

		entidad.belongsTo(n.generos, {as: "genero", foreignKey: "genero_id"});
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.belongsTo(n.epocasOcurrencia, {as: "epocaOcurrencia", foreignKey: "epocaOcurrencia_id"});
		entidad.belongsTo(n.hechos, {as: "apMar", foreignKey: "apMar_id"});
		entidad.belongsTo(n.canons, {as: "canon", foreignKey: "canon_id"});
		entidad.belongsTo(n.rolesIglesia, {as: "rolIglesia", foreignKey: "rolIglesia_id"});

		entidad.belongsTo(n.usuarios, {as: "editadoPor", foreignKey: "editadoPor_id"});
	};
	return entidad;
};
