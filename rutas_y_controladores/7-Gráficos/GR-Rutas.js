"use strict";
// Requires ************************************************
const router = express.Router();
const API = require("./GR-ControlAPI");
const vista = require("./GR-ControlVista");

// Middlewares ***********************************************

// API
router.get("/api/peliculas-cfc-y-vpc", API.pelisCfcVpc);
router.get("/api/peliculas-aprobadas", API.pelisAprob);
router.get("/api/vencimiento-de-links", API.vencimLinks);
router.get("/api/links-por-proveedor", API.linksPorProv);

// Vistas *******************************************
router.get("/peliculas-cfc-y-vpc", vista.pelisCfcVpc);
router.get("/peliculas-aprobadas", vista.pelisAprob);

router.get("/vencimiento-de-links", vista.vencimLinks);
router.get("/links-por-proveedor", vista.linksPorProv);

// Exportarlo **********************************************
module.exports = router;
