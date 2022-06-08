"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/obtener-col-cap", API.obtenerColCap);
router.get("/api/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/api/obtener-cap-id", API.obtenerCapID);
router.get("/api/averiguar-capitulos", API.obtenerCapitulos);

// Fin
module.exports = router;
