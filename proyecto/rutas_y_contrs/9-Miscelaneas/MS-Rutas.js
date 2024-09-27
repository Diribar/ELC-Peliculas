"use strict";
// Variables
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

// Middlewares - Varios
const entidadRclv = require("../../middlewares/porRegistro/entidadRclv");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Redireciona
router.get("/", vista.inicio);
router.get("/inicio", vista.redirecciona.inicio);
router.get("/inactivar-captura/ms/:entidad/:id", capturaInactivar, vista.redirecciona.urlDeOrigen);

// Información para mostrar en el explorador
router.get("/session", vista.listados.session);
router.get("/cookies", vista.listados.cookies);
router.get("/listados/rclvs", entidadRclv, vista.listados.rclvs);// busca los rclvs con más cantidad de películas
router.get("/listados/links", vista.listados.links); // busca las películas con más cantidad de links

// Fin
module.exports = router;
