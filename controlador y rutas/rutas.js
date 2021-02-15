const express= require('express');
const controlador = require('./controlador')

const router = express.Router();

router.get('/', controlador.home)
router.get('/:id', controlador.main)
router.get('/peliculas/:id', controlador.main)

module.exports = router;
