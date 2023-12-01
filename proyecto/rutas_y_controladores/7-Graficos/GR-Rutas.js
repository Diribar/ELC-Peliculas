"use strict";
// Requires ************************************************
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// Middlewares ***********************************************

// API
router.get("/api/peliculas-cfc-vpc", API.pelisCfcVpc);
router.get("/api/peliculas-publico", API.pelisPublico);
router.get("/api/vencimiento-de-links", API.vencimLinks);
router.get("/api/links-por-proveedor", API.linksPorProv);

// Vistas *******************************************
router.get("/peliculas-cfc-vpc", vista.pelisCfcVpc);
router.get("/peliculas-publico", vista.pelisPublico);
router.get("/vencimiento-de-links", vista.vencimLinks);
router.get("/links-por-proveedor", vista.linksPorProv);
router.get("/rangos-sin-efemerides", vista.rangosSinEfemerides);

// Exportarlo **********************************************
module.exports = router;
