module.exports = (sequelize, dt) => {
	const alias = "prodsComplem";
	const columns = {
		entidad: {type: dt.STRING(20)},
		entidad_id: {type: dt.INTEGER},

		linksTrailer: {type: dt.INTEGER},
		linksGral: {type: dt.INTEGER},
		linksGratis: {type: dt.INTEGER},
		linksCast: {type: dt.INTEGER},
		linksSubt: {type: dt.INTEGER},
		HD_Gral: {type: dt.INTEGER},
		HD_Gratis: {type: dt.INTEGER},
		HD_Cast: {type: dt.INTEGER},
		HD_Subt: {type: dt.INTEGER},

		feValores: {type: dt.INTEGER},
		entretiene: {type: dt.INTEGER},
		calidadTecnica: {type: dt.INTEGER},
		calificacion: {type: dt.INTEGER},
		azar: {type: dt.INTEGER},

		capturadoPor_id: {type: dt.INTEGER},
		capturadoEn: {type: dt.DATE},
		capturaActiva: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "prod_9complem",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "capturadoPor", foreignKey: "capturadoPor_id"});
	};
	return entidad;
};
