const fs = require('fs');
const path = require('path');
const path_titulos_web = path.join(__dirname, '../../bases_de_datos/titulos_web.json');
const path_usuarios = path.join(__dirname, '../../bases_de_datos/usuarios.json');

const controlador = {

	login: (req,res) => { /* LOGIN --> GET */
		let título = "Login";
		res.render('00Base_General/ELC', {título})
	},

	registro: (req,res) => { /* REGISTRO --> GET */
		let título = "Registro";
		res.render('00Base_General/ELC', {título})
	},

	main: (req,res) => { /* HOME - QUIÉNES SOMOS - CONTÁCTANOS --> GET */
		let url = req.params.id;
		const títulos_web = JSON.parse(fs.readFileSync(path_titulos_web, 'utf-8'));
		let título_web = títulos_web.find((n) => {return n.url == url})
		let título = título_web.título
		res.render('00Base_General/ELC', {título})
	},

	login_realizado: (req,res) => { /* LOGIN --> POST */
		let usuario = req.body
		res.redirect('/home')
	},

	registro_realizado: (req,res) => { /* REGISTRO --> POST */
		const usuarios = JSON.parse(fs.readFileSync(path_usuarios, 'utf-8'));
		nuevoID = usuarios.length > 0 ? usuarios[usuarios.length-1].id + 1 : 1;
		const nuevo_usuario = {
			id: nuevoID,
			...req.body,
		};
		usuarios.push(nuevo_usuario);
		let guardado = JSON.stringify(usuarios);
		fs.writeFileSync(path_usuarios, guardado);
		res.redirect('/home')
	},

};

module.exports = controlador;
