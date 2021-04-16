//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/peliculas')
const opciones = require('../controladores/peliculas_opciones')

//************************ Middlewares ******************************
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');
const soloAdmin = require('../../middlewares/usuarios/soloAdmin');
const importarPeliculasA = require('../../middlewares/peliculas/importarA');
const importarPeliculasB = require('../../middlewares/peliculas/importarB');
const validar1A = require('../../middlewares/peliculas/validar1A');
const validar1B = require('../../middlewares/peliculas/validar1B');
const validar1C = require('../../middlewares/peliculas/validar1C');
const validar2 = require('../../middlewares/peliculas/validar2');
const validar3 = require('../../middlewares/peliculas/validar3');
const uploadFile = require('../../middlewares/varios/multer');

//******************* Controladores de CRUD *************************
// -- CREATE -------------------------
router.get('/agregar1', soloAdmin, peliculas.altaForm1);
router.post('/agregar1A', validar1A, importarPeliculasA, peliculas.altaGuardar1);
router.post('/agregar1B', validar1B, importarPeliculasB, peliculas.altaGuardar1);
router.post('/agregar1C', validar1C, peliculas.altaGuardar1);

router.get('/agregar2', soloAdmin, peliculas.altaForm2);
router.post('/agregar2', validar2, peliculas.altaGuardar2);
router.get('/agregar3', soloAdmin, peliculas.altaForm3);
router.post('/agregar3', uploadFile.single('imagen'), validar3, peliculas.altaGuardar3);

// -- RUD (GET) --------------------------
router.get('/detalle/editar/:id', soloAdmin, peliculas.detalle);
router.get('/detalle/eliminar/:id', soloAdmin, peliculas.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, peliculas.detalle);
router.get('/detalle/:id/:id', peliculas.detalle);
// -- UD (POST) -------------------------
router.post('/detalle/editar/:id', peliculas.editarGuardar);
router.post('/detalle/eliminar/:id', peliculas.bajaGuardar);

// Controladores de Opciones ****************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.post('/:id/:id', soloUsuarios, opciones.filtros);        // Filtros

// Exportarlo *******************************************************
module.exports = router;
