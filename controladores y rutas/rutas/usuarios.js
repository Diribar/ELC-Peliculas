//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuarios = require('../controladores/usuarios')

//************************ Middlewares ******************************
const validarMail = require('../../middlewares/validarMail');    // Validar mail y contraseña
const validarNombre = require('../../middlewares/validarNombre');    // Validar mail y contraseña
const logoutMiddleware = require('../../middlewares/si_esta_logueado_LOGOUT');  // Para prevenir ciertos accesos cuando SI está logueado
const loginMiddleware = require('../../middlewares/si_no_esta_logueado_LOGIN');  // Para prevenir ciertos accesos cuando NO está logueado
const uploadFile = require('../../middlewares/multer');            // Para usar archivos en formularios 

//************************ Controladores ****************************
router.get('/registro-mail', logoutMiddleware, usuarios.altaFormMail)
router.post('/registro-mail', logoutMiddleware, validarMail, usuarios.altaGuardarMail)

router.get('/registro-nombre', loginMiddleware, usuarios.altaFormNombre)
router.post('/registro-nombre', loginMiddleware, validarNombre, usuarios.altaGuardarNombre)

router.get('/registro-nombre', loginMiddleware, usuarios.altaFormNombre)
router.post('/registro-nombre', loginMiddleware, uploadFile.single('imagen'), validarNombre, usuarios.altaGuardarNombre)

router.get('/detalle', loginMiddleware, usuarios.detalle)          // Detalle
router.get('/editar', loginMiddleware, usuarios.editarForm)        // Modificar
router.put('/editar', loginMiddleware, uploadFile.single('imagen'), validarMail, validarNombre, usuarios.editarGuardar)
router.delete('/eliminar', loginMiddleware, usuarios.baja)         // Baja

module.exports = router;
