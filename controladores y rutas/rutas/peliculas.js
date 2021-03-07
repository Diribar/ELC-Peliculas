//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const CRUD = require('../controladores/peliculas_CRUD')
const opciones = require('../controladores/peliculas_opciones')

//************************ Middlewares ******************************
const login_rutaSI = require('../../middlewares/login_rutaSI'); // Para prevenir ciertos accesos cuando SI está logueado

// *************************** CRUD *********************************
router.get('/nueva', login_rutaSI, CRUD.altaForm);              // Alta
router.post('/nueva', CRUD.altaGuardar);                        // Alta
router.delete('/eliminar/:id', login_rutaSI, CRUD.baja);        // Baja
router.get('/editar/:id', login_rutaSI, CRUD.editarForm);       // Modificar
router.put('/editar/:id', CRUD.editarGuardar);                  // Modificar
router.get('/detalle/:id', CRUD.detalle);                       // Detalle

// ************************* Opciones ********************************
router.get('/', opciones.listado);                              // Opción: Home
router.get('/cfc', opciones.cfc);                               // Opción: CFC
router.get('/vpc', opciones.vpc);                               // Opción: VPC
router.get('/cfc/:id', opciones.cfcid);                         // Opción: CFC/id
router.get('/vpc/:id', opciones.vpcid);                         // Opción: VPC/id
router.post('/filtros/:id', login_rutaSI, opciones.filtros);    // Filtros

module.exports = router;
