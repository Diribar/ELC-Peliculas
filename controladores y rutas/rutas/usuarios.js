//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuarios = require('../controladores/usuarios')

//************************ Middlewares ******************************
const uploadFile = require('../../middlewares/multer');            // Para usar archivos en formularios 
const validarLogin = require('../../middlewares/validarLogin');    // ValidarLogin
const login_ruta_SI = require('../../middlewares/login_ruta_SI');  // Para prevenir ciertos accesos cuando SI está logueado
const login_ruta_NO = require('../../middlewares/login_ruta_NO');  // Para prevenir ciertos accesos cuando NO está logueado

//**************************** CRUD *********************************
router.get('/registro', usuarios.altaForm)                         // Alta
router.post('/registro', validarLogin, usuarios.altaGuardar)       // Alta

router.get('/datos', usuarios.altaForm2)               // Alta
router.post('/datos', uploadFile.single('imagen'), validarLogin, usuarios.altaGuardar2)
router.delete('/eliminar/:id', login_ruta_SI, usuarios.baja)         // Baja
router.get('/editar/:id', login_ruta_SI, usuarios.editarForm)        // Modificar
router.put('/editar/:id', uploadFile.single('imagen'), validarLogin, usuarios.editarGuardar)
router.get('/detalle/:id', login_ruta_SI, usuarios.detalle)          // Detalle

module.exports = router;
