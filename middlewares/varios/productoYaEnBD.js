let procesarProd = require("../../funciones/Productos/2-PROD-procesar");

module.exports = async (req, res, next) => {
	IDdelProducto = req.cookies.IDdelProducto;
	ruta = "/agregar/productos/ya-en-bd/?id=";
	ELC_id = await procesarProd.obtenerELC_id(IDdelProducto);
	if (ELC_id) return res.redirect(ruta + ELC_id);
	next();
};
