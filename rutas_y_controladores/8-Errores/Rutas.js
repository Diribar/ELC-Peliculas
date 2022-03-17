// Requires ************************************************
const express = require("express");
const router = express.Router();
let vista = require("./ControladorVista");


// Controladores *******************************************
router.get("/producto-no-encontrado", vista.prodNoEncontrado);
router.get("/producto-no-aprobado", vista.prodNoAprobado);
router.get("/solo-usuarios-autorizados/inputs", vista.soloAutInput);
router.get("/solo-usuarios-autorizados/gestion", vista.soloGestionProd);

// Exportarlo **********************************************
module.exports = router;
