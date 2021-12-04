// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");

// Controladores *******************************************
// Controladores de APIs
router.get("/agregar/api/RCVL-otros-casos/", API.buscarOtrosCasos);
router.get("/agregar/api/rclv/", API.validarRCLV);
router.get("/quick-search/", API.quickSearch);

// Controladores de vistas - Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);

// Controladores de vistas - Relación con la vida
router.get("/agregar/relacion-vida", usuarios, vista.RCLV);
router.get("/agregar/personaje-historico", usuarios, vista.RCLV_Form);
router.post("/agregar/personaje-historico", usuarios, vista.RCLV_Grabar);
router.get("/agregar/hecho-historico", usuarios, vista.RCLV_Form);
router.post("/agregar/hecho-historico", usuarios, vista.RCLV_Grabar);

// Exportarlo **********************************************
module.exports = router;
