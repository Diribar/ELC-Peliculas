// Requires ************************************************
const express = require("express");
const router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");

// Controladores *******************************************
// Controladores de APIs
router.get("/agregar/api/buscar-otros-casos-en-esa-fecha/", API.buscarOtrosCasos);
router.get("/agregar/api/validar-relacion-con-la-vida/", API.validarRV);

// Controladores de vistas - Institucional
router.get("/", vista.home);
router.get("/nosotros", vista.nosotros);

// Controladores de vistas - Relación con la vida
router.get("/agregar/relacion-vida", usuarios, vista.relacionConLaVida);
router.get("/agregar/personaje-historico", usuarios, vista.RV_Form);
router.post("/agregar/personaje-historico", usuarios, vista.RV_Grabar);
router.get("/agregar/hecho-historico", usuarios, vista.RV_Form);
router.post("/agregar/hecho-historico", usuarios, vista.RV_Grabar);

// Exportarlo **********************************************
module.exports = router;
