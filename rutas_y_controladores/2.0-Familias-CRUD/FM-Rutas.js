"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./FM-ControlAPI");

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/obtiene-col-cap", API.obtieneColCap);
router.get("/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/api/obtiene-cap-id", API.obtieneCapID);
router.get("/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/api/motivos-status", API.motivosRechAltas);
router.get("/api/actualiza-visibles", API.actualizarVisibles);

// Fin
module.exports = router;
