const varias = require("../../funciones/Varias/Varias");

module.exports = async (req, res, next) => {
	let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, "status_registro").then((n) =>
		n.toJSON()
	);
	// ¿Producto capturado?
	if (prodOriginal.capturado_en > varias.funcionHaceUnaHora())
		return res.render("Errores", {
			mensaje: "El producto está en revisión. Una vez revisado, podrás acceder a esta vista",
		});
	else next()
};
