const varias = require("../../funciones/Varias/Varias");
const BD_varias = require("../../funciones/BD/Varias");

module.exports = async (req, res, next) => {
	// Evaluar:
	//	1. Si el producto existe
	//	2. Si el producto está aprobado o es la ventana disponible para el usuario creador (sólo 'edición')

	// Definir variables
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	let url = req.url.slice(1);
	let codigo = url.slice(0, url.indexOf("/"));
	let prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, "status_registro").then((n) =>
		n ? n.toJSON() : ""
	);
	let mensaje = "";
	// Problema: PRODUCTO NO ENCONTRADO
	if (!prodOriginal) mensaje = "Producto no encontrado";
	else {
		// Problema: PRODUCTO NO APROBADO
		let pendAprobar = prodOriginal.status_registro.pend_aprobar;
		// 1-¿Producto en estado 'pend_aprobar'?
		if (pendAprobar) {
			// 2-¿Creado por el usuario?
			let creadoPorElUsuario1 = prodOriginal.creado_por_id == userID;
			let creadoPorElUsuario2 =
				entidad != "capitulos" ||
				(entidad == "capitulos" && prodOriginal.coleccion.creado_por_id != userID);
			if (creadoPorElUsuario1 || creadoPorElUsuario2) {
				// 3-¿La vista es "Edición"?
				if (codigo == "edicion") {
					// 4-¿Creado < haceUnaHora?
					if (prodOriginal.creado_en < varias.funcionHaceUnaHora())
						mensaje =
							"Expiró el tiempo de edición. Está a disposición de nuestro equipo para su revisión";
				}
			} else
				mensaje =
					"El producto no está aprobado aún para ser mostrado o editado. El status actual es: " +
					prodOriginal.status_registro.nombre;
		}
	}
	// Fin
	if (mensaje) return res.render("Errores", {mensaje});
	else next();
};
