//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/peliculas')
const opciones = require('../controladores/peliculas_opciones')

//************************ Middlewares ******************************
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');
const soloAdmin = require('../../middlewares/usuarios/soloAdmin');
const importarPeliculas = require('../../middlewares/peliculas/importar');
const validarPeliculas1A = require('../../middlewares/peliculas/validar1A');
const validarPeliculas1B = require('../../middlewares/peliculas/validar1B');
const validarPeliculas2 = require('../../middlewares/peliculas/validar2');
const validarPeliculas3 = require('../../middlewares/peliculas/validar3');
const uploadFile = require('../../middlewares/varios/multer');

//******************* Controladores de CRUD *************************
// -- CREATE -------------------------
router.get('/agregar1', soloAdmin, peliculas.altaForm1);
router.post('/agregar1A', validarPeliculas1A, importarPeliculas, peliculas.altaGuardar1);
router.post('/agregar1B', validarPeliculas1B, peliculas.altaGuardar1);

router.get('/agregar2', soloAdmin, peliculas.altaForm2);
router.post('/agregar2', validarPeliculas2, peliculas.altaGuardar2);
router.get('/agregar3', soloAdmin, peliculas.altaForm3);
router.post('/agregar3', uploadFile.single('imagen'), validarPeliculas3, peliculas.altaGuardar3);

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
