//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const listado = require('../controladores/listado')
const importarPaises = require('../../middlewares/importarPaises');

router.get('/', importarPaises, listado.listado)

module.exports = router;
