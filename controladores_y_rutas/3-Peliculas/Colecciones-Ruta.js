//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const colecciones = require("./Colecciones-Contr");
const colecc_pelic = require("./Colecc-Pelic-Contr");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const importar = require("../../middlewares/PEL-1A-importar_x_API/1importarA");
const validar2 = require("../../middlewares/PEL-0-validarForms/2_DatosDuros");
const validar3 = require("../../middlewares/PEL-0-validarForms/3_DatosElaborados");
const uploadFile = require("../../middlewares/varios/multer");

//******************* Controladores de CRUD *************************
// -- Desambiguar --------------------------


// -- Datos Duros -----------------------------
router.get("/agregar2", soloUsuarios, colecciones.altaForm2);
router.post("/agregar2", soloUsuarios, validar2, colecciones.altaGuardar2);

// -- Datos Adicionales -----------------------
router.get("/agregar3", soloUsuarios, colecciones.altaForm3);
router.post('/agregar3', soloUsuarios, uploadFile.single('imagen'), validar3, colecciones.altaGuardar3);

// -- RUD (GET) --------------------------
router.get("/detalle/editar/:id", soloUsuarios, colecciones.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, colecciones.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, colecciones.detalle);
router.get('/detalle/:id/:id', colecciones.detalle);
// -- UD (POST) -------------------------
router.post('/detalle/editar/:id', colecciones.editarGuardar);
router.post('/detalle/eliminar/:id', colecciones.bajaGuardar);

// Exportarlo *******************************************************
module.exports = router;
