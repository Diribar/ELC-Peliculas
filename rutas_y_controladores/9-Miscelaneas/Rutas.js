// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");

// Controladores *******************************************
// Controladores de APIs
router.get("/agregar/api/rclv-otros-casos/", API.buscarOtrosCasos);
router.get("/agregar/api/rclv/", API.validarRCLV);
router.get("/quick-search/", API.quickSearch);

// Controladores de vistas - Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);

// Controladores de vistas - Relación con la vida
router.get("/agregar/relacion-vida", usuarios, vista.RCLV);
router.get("/agregar/RCLV_personajes_historicos", usuarios, vista.RCLV_Form);
router.get("/agregar/RCLV_hechos_historicos", usuarios, vista.RCLV_Form);
router.post("/agregar/RCLV_personajes_historicos", usuarios, vista.RCLV_Grabar);
router.post("/agregar/RCLV_hechos_historicos", usuarios, vista.RCLV_Grabar);

// Exportarlo **********************************************
module.exports = router;
