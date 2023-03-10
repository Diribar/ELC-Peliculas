"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./FM-ControlAPI");
const vista = require("./FM-ControlVista");

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/obtiene-col-cap", API.obtieneColCap);
router.get("/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/api/obtiene-cap-id", API.obtieneCapID);
router.get("/api/averigua-capitulos", API.obtieneCapitulos);

// Rutas de vistas
router.get("/inactivar", vista.inactivarForm);
router.post("/inactivar", vista.inactivarGuardar);
router.get("/recuperar", vista.recuperarForm);

// Fin
module.exports = router;
