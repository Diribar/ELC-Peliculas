//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const colecciones = require("./COL-CRUD-Contr");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const validar1A = require("../../middlewares/PEL-0-validarForms/1A_PalabraClave");
const validar1B = require("../../middlewares/PEL-0-validarForms/1B_ImportarDatos");
const validar1C = require("../../middlewares/PEL-0-validarForms/1C_Datos_a_Mano");
const validar2 = require("../../middlewares/PEL-0-validarForms/2_DatosDuros");
const validar3 = require("../../middlewares/PEL-0-validarForms/3_DatosElaborados");
const importarA = require("../../middlewares/PEL-1A-importar_x_API/1importarA");
const importarB = require("../../middlewares/PEL-1B-importar_x_copy/importarB");
const uploadFile = require("../../middlewares/varios/multer");

//******************* Controladores de CRUD *************************
// -- Importar Datos --------------------------
router.get("/agregar1", soloUsuarios, colecciones.altaForm1);
router.post('/agregar1A', soloUsuarios, validar1A, importarA, colecciones.altaGuardar1);
router.post('/agregar1B', soloUsuarios, validar1B, importarB, colecciones.altaGuardar1);
router.post("/agregar1C", soloUsuarios, validar1C, colecciones.altaGuardar1);

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
