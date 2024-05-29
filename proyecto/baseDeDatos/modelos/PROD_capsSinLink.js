module.exports = (sequelize, dt) => {
	const alias = "capsSinLink";
	const columns = {
		coleccion_id: {type: dt.INTEGER},
		linksTrailer: {type: dt.INTEGER},

		linksGral: {type: dt.INTEGER},
		linksGratis: {type: dt.INTEGER},
		linksCast: {type: dt.INTEGER},
		linksSubt: {type: dt.INTEGER},

		HD_Gral: {type: dt.INTEGER},
		HD_Gratis: {type: dt.INTEGER},
		HD_Cast: {type: dt.INTEGER},
		HD_Subt: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_caps_sin_link",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.colecciones, {as: "coleccion", foreignKey: "coleccion_id"});
	};
	return entidad;
};
