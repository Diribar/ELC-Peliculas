//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const colecciones = require("./3-Colecciones-Contr");

//************************ Middlewares ******************************
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');
const soloAdmin = require('../../middlewares/usuarios/soloAdmin');
const validar1A = require('../../middlewares/PEL-0-validarForms/validar1A');
const validar1B = require('../../middlewares/PEL-0-validarForms/1B_ImportarDatos');
const validar1C = require('../../middlewares/PEL-0-validarForms/1C_Datos_a_Mano');
const validar2 = require('../../middlewares/PEL-0-validarForms/2_DatosDuros');
const validar3 = require('../../middlewares/PEL-0-validarForms/3_DatosElaborados');
const importarA = require('../../middlewares/PEL-1A-importar_x_API/1importarA');
const importarB = require('../../middlewares/PEL-1B-importar_x_copy/importarB');
const uploadFile = require('../../middlewares/varios/multer');

//******************* Controladores de CRUD *************************
// -- CREATE -------------------------
router.get('/agregar1', soloAdmin, colecciones.altaForm1);
router.post('/agregar1A', validar1A, importarA, colecciones.altaGuardar1);
router.post('/agregar1B', validar1B, importarB, colecciones.altaGuardar1);
router.post('/agregar1C', validar1C, colecciones.altaGuardar1);

router.get('/agregar2', soloAdmin, colecciones.altaForm2);
router.post('/agregar2', validar2, colecciones.altaGuardar2);
router.get('/agregar3', soloAdmin, colecciones.altaForm3);
router.post('/agregar3', uploadFile.single('imagen'), validar3, colecciones.altaGuardar3);

// -- RUD (GET) --------------------------
router.get('/detalle/editar/:id', soloAdmin, colecciones.detalle);
router.get('/detalle/eliminar/:id', soloAdmin, colecciones.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, colecciones.detalle);
router.get('/detalle/:id/:id', colecciones.detalle);
// -- UD (POST) -------------------------
router.post('/detalle/editar/:id', colecciones.editarGuardar);
router.post('/detalle/eliminar/:id', colecciones.bajaGuardar);

// Exportarlo *******************************************************
module.exports = router;
