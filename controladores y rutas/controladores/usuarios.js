// ************ Requires ************
const fs = require('fs');
const path = require('path')
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/usuarios.json');
const imagesPath = path.join(__dirname, "../public/images/users/");

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};

// *********** Controlador ***********
module.exports = {

	altaFormMail: (req, res) => {
		return res.render('0-Usuarios', {
			link: req.originalUrl,
			usuarioEnBD: null,
			titulo: "Registro de Mail"
		});
	},
	
	altaGuardarMail: (req, res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Averiguar si existe el mail en la BD
		let BD = leer(ruta_nombre);
		let usuarioEnBD = BD.find(n => n.email == req.body.email)
		// Verificar si existe algún error de validación
		if (validaciones.errors.length > 0 || usuarioEnBD) {
			// Regresar al formulario
			return res.render('0-Usuarios', {
				link: req.originalUrl,
				usuarioEnBD,
				errores: validaciones.mapped(),
				data_entry: req.body,
				titulo: "Registro de Mail"
			});
		};
		// Preparar el registro para almacenar
		const nuevoId = BD.length > 0 ? BD[BD.length - 1].id + 1 : 1;
		const nuevoUsuario = {
			id: nuevoId,
			...req.body,
			contrasena: bcryptjs.hashSync(req.body.contrasena, 10),
			MailFecha: new Date().toLocaleDateString('es-ES'),
			MailHora: new Date().toLocaleTimeString('es-ES').slice(0,-3),
			activo: false,
			formNombre: false,
			formSobrenombre: false,
		};
		// Guardar el registro
		BD.push(nuevoUsuario);
		guardar(ruta_nombre, BD);
		// Login
		req.session.usuarioLogueado = true;
		req.session.usuario = nuevoUsuario;
		// Redireccionar
		res.redirect("/usuarios/registro-nombre");
	},

	altaFormNombre: (req,res) => {
		return res.render('0-Usuarios', {
			errorDeAno: [],
			link: req.originalUrl,
			usuario: req.session.usuario,
			titulo: "Registro de Nombre"
		});
	},

	altaGuardarNombre: (req,res) => {
		usuario = req.session.usuario;
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Varificar que la fecha sea razonable
		let ano = req.body.fecha.slice(0,4);
		let max = new Date().getFullYear()-10;
		let min = new Date().getFullYear()-100;
		let errorDeAno = [];
		if (ano>max || ano<min) {
			errorDeAno.test=true;
			errorDeAno.msg = "¿Estás seguro de que introdujiste la fecha correcta?";
		}
		// Recuperar datos de la session
		req.session.usuarioLogueado = true;
		req.session.usuario = usuario;
		// Verificar si existe algún error de validación
		if (validaciones.length>0 || !!errorDeAno.length>0) {
			// Regresar al formulario
			return res.render('0-Usuarios', {
				errorDeAno,
				link: req.originalUrl,
				usuario,
				errores: validaciones.mapped(),
				data_entry: req.body,
				titulo: "Registro de Nombre"
			});
		};
		// Preparar el registro para almacenar
		let BD = leer(ruta_nombre);
		let usuarioEnBD = BD.find(n => n.email == req.body.email);
		const actualizado = {
			...usuarioEnBD,
			...req.body,
			NombreFecha: new Date().toLocaleDateString('es-ES'),
			NombreHora: new Date().toLocaleTimeString('es-ES').slice(0,-3),
			formNombre: true,
		};
		let indice = BD.findIndex(n => n.id == actualizado.id)
		BD[indice] = actualizado
		guardar(ruta_nombre, BD);
	},

	detalle: (req, res) => {
		let registro = encontrarID(req.params.id);
		res.render('detalle', {registro});
	},

	editarForm: (req, res) => {
		let registro = encontrarID(req.params.id);
		res.render('editar', {registro});
	},

	editarGuardar: (req, res) => {
		// Obtener el contenido actualizado del registro
		let registro = encontrarID(req.params.id);
		const reg_actual = {
			...registro,
			...req.body,
		};
		// Eliminar imagen anterior
		let BD = leer(ruta_nombre);
		if (req.file) {
			reg_actual.image = req.file.filename;
			if (BD.image) {fs.unlinkSync(path.join(__dirname, RutaDeImagenes, BD.image));}
		}
		// Reemplazar el registro con el contenido actual
		let indice = BD.indexOf(registro)
		BD[indice] = reg_actual
		// Guardar los cambios
		guardar(ruta_nombre, BD);
		res.redirect("/usuario/" + req.params.id);
	},	

	baja: (req, res) => {
		let BD = leer(ruta_nombre);
		let nuevaBD = BD.filter(n => n.id != req.params.id)
		guardar(ruta_nombre, nuevaBD)
		res.redirect("/");
	},

};
