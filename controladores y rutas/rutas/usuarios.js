//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const CRUD = require('../controladores/usuarios_CRUD')

//************************ Middlewares ******************************
const uploadFile = require('../../middlewares/multer');            // Para usar archivos en formularios 
const validaciones = require('../../middlewares/validaciones');    // Validaciones
const login_rutaSI = require('../../middlewares/login_rutaSI');// Para prevenir ciertos accesos cuando SI está logueado
const login_rutaNO = require('../../middlewares/login_rutaNO');       // Para prevenir ciertos accesos cuando NO está logueado

//**************************** CRUD *********************************
router.get('/nuevo', login_rutaNO, CRUD.altaForm)               // Alta
router.post('/nuevo', uploadFile.single('imagen'), validaciones, CRUD.altaGuardar)
router.delete('/eliminar/:id', login_rutaSI, CRUD.baja)         // Baja
router.get('/editar/:id', login_rutaSI, CRUD.editarForm)        // Modificar
router.put('/editar/:id', uploadFile.single('imagen'), validaciones, CRUD.editarGuardar)
router.get('/detalle/:id', login_rutaSI, CRUD.detalle)          // Detalle

module.exports = router;
