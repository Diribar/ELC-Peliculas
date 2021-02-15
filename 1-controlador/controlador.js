// var masVendidos = require('../public/javascripts/masVendidos')
// var novedades = require('../public/javascripts/novedades')

const controlador = {
	home: (req,res) => {res.render('ecc')},
	main: (req,res) => {res.render(req.params.id)},
};

module.exports = controlador;
