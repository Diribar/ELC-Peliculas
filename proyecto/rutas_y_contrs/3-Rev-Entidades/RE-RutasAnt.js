"use strict";
// Variables
const router = express.Router();

// Funciones
let redirecciona = (req, res) => {
	// Variables
	const {entidad, id} = req.query;
	const familia = comp.obtieneDesdeEntidad.familia(entidad);
	let {originalUrl} = req;

	// Reemplaza la familia por la entidad
	if (["/producto/", "/rclv/"].some((n) => originalUrl.includes(n)))
		originalUrl = originalUrl.replace("/" + familia + "/", "/" + entidad + "/"); // /peliculas/
	// Si no existía la familia, le agrega la entidad
	else originalUrl = "/" + entidad + originalUrl; // /peliculas/cm - /personaje/cs

	// Quita la entidad y el id del url
	originalUrl = originalUrl.replace("entidad=" + entidad + "&", "");
	originalUrl = originalUrl.replace("/?id=" + id, "/" + id + "/?");
	originalUrl = originalUrl.replace("?&", "?");
	if (originalUrl.endsWith("?")) originalUrl = originalUrl.slice(0, -1);
	if (originalUrl.endsWith("/")) originalUrl = originalUrl.slice(0, -1);

	// Reemplaza la ruta anterior por la actual
	const rutasActualizadas = comp.rutasActualizadas(entidad);
	const ruta = rutasActualizadas.find((n) => originalUrl.includes(n.ant));
	if (ruta) originalUrl = originalUrl.replace(ruta.ant, ruta.act);

	// Fin
	return res.redirect(originalUrl);
};

router.get("/tablero-de-entidades", redirecciona);
router.get("/tablero-de-mantenimiento", redirecciona);
router.get("/:familia/alta", redirecciona); // Altas
router.get("/:familia/rechazar", redirecciona); // Rechazar
router.get("/:familia/edicion", redirecciona); // Edición
router.get("/:familia/inactivar", redirecciona); // Revisar Inactivar
router.get("/:familia/recuperar", redirecciona); // Revisar Recuperar
router.get("/rclv/solapamiento", redirecciona); // Solapamiento
router.get("/links", redirecciona); // Links

// Fin
module.exports = router;
