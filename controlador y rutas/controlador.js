const controlador = {
	home: (req,res) => {
		let título = "ECC";
		res.render('PLANTILLA', {título})
	},
	main: (req,res) => {
		let título = req.params.id;
		res.render('PLANTILLA', {título})
	},

	peliculas: (req,res) => {
		let título = "Películas"
		res.render('PLANTILLA', {título});
	},
	peli_filtros: (req,res) => {
		let user_entry = req.query;
		let pelis = [{nombre: "San Francisco de Asís"},{nombre: "Un hombre para la eternidad"},{nombre: "Molokai"},];
		let results = [];
		for (let i=0; i < pelis.length; i++) {
			if (pelis[i].nombre.toLowerCase().includes(user_entry.palabras_clave.toLowerCase())) {results.push(pelis[i])}
		}
		res.send(results);
/*		res.render('página-de-resultados', results); */
	},
};

module.exports = controlador;
