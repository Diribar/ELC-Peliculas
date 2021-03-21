//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const CRUD = require('../controladores/usuarios')

//************************ Middlewares ******************************
const uploadFile = require('../../middlewares/multer');            // Para usar archivos en formularios 
const validaciones = require('../../middlewares/validaciones');    // Validaciones
const login_ruta_SI = require('../../middlewares/login_ruta_SI');// Para prevenir ciertos accesos cuando SI está logueado
const login_ruta_NO = require('../../middlewares/login_ruta_NO');       // Para prevenir ciertos accesos cuando NO está logueado

//**************************** CRUD *********************************
//router.get('/nuevo', login_rutaNO, CRUD.altaForm)               // Alta
router.get('/registro', CRUD.altaForm)               // Alta
router.post('/registro', validaciones, CRUD.altaGuardar)
router.get('/registro2', CRUD.altaForm2)               // Alta
router.post('/registro2', uploadFile.single('imagen'), validaciones, CRUD.altaGuardar2)
router.delete('/eliminar/:id', login_ruta_SI, CRUD.baja)         // Baja
router.get('/editar/:id', login_ruta_SI, CRUD.editarForm)        // Modificar
router.put('/editar/:id', uploadFile.single('imagen'), validaciones, CRUD.editarGuardar)
router.get('/detalle/:id', login_ruta_SI, CRUD.detalle)          // Detalle

module.exports = router;
