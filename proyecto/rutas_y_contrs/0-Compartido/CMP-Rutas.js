"use strict";
// Variables
const router = express.Router();
const API = require("./CMP-ControlAPI");
const vista = require("./CMP-ControlVista");

// Middlewares - Varios
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Redireciona
router.get("/inactivar-captura", capturaInactivar, vista.redirecciona);

// Fin
module.exports = router;
