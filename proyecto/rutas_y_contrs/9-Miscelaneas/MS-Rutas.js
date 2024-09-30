"use strict";
// Variables
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

// Middlewares - Varios
const entValida = require("../../middlewares/porRegistro/entidadValida");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
const entidadRclv = require("../../middlewares/porRegistro/entidadRclv");

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Vista
router.get("/", vista.inicio);

// Redireciona
router.get("/inicio", vista.redirecciona.inicio);
router.get("/miscelaneas/ic/:entidad", entValida, capturaInactivar, vista.redirecciona.urlDeOrigen);

// Información para mostrar en el explorador
router.get("/session", vista.listados.session);
router.get("/cookies", vista.listados.cookies);
router.get("/listados/rclvs", entidadRclv, vista.listados.rclvs); // busca los rclvs con más cantidad de películas
router.get("/listados/links", vista.listados.links); // busca las películas con más cantidad de links

// Fin
module.exports = router;
