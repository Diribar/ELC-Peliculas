"use strict";
// Variables
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// API
router.get("/api/peliculas-cfc-vpc", API.pelisCfcVpc);
router.get("/api/peliculas-publico", API.pelisPublico);
router.get("/api/links-vencimiento", API.linksVencim);
router.get("/api/links-por-proveedor", API.linksPorProv);
router.get("/api/rangos-sin-efemerides", API.rangosSinEfs);

// Vistas
router.get("/peliculas-cfc-vpc", vista.pelisCfcVpc);
router.get("/peliculas-publico", vista.pelisPublico);
router.get("/peliculas-publico", vista.pelisPublico);
router.get("/links-vencimiento", vista.linksVencim);
router.get("/links-por-proveedor", vista.linksPorProv);
router.get("/rangos-sin-efemerides", vista.rangosSinEfs);

// Fin
module.exports = router;
