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
function mailEnBD(texto, usuarios) {let usuario = usuarios.find(n => n.email === texto);return usuario;}

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
		// Validar email con la BD
		let usuarios = leer(ruta_nombre);
		let usuarioEnBD = mailEnBD(req.body.email,usuarios);
		// Verificar si existe algún error de validación
		if (validaciones.errors.length > 0 || usuarioEnBD) {
			// Regresar al formulario de crear
			return res.render('0-Usuarios', {
				link: req.originalUrl,
				usuarioEnBD,
				errores: validaciones.mapped(),
				data_entry: req.body,
				titulo: "Registro de Mail"
			});
		};
		// Preparar el registro para almacenar
		usuarios = leer(ruta_nombre);
		const nuevoId = usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1;
		const nuevoUsuario = {
			id: nuevoId,
			...req.body,
			contrasena: bcryptjs.hashSync(req.body.contrasena, 10),
			activo: false,
		};
		// Guardar el registro
		usuarios.push(nuevoUsuario);
		guardar(ruta_nombre, usuarios);
		// Login
		req.session.usuarioLogueado = true;
		req.session.usuario = nuevoUsuario;
		req.session.usuarioActivo = false;
		req.session.usuarioNombre = false;
		req.session.usuarioSobrenombre = false;
		// Redireccionar
		res.redirect("/usuarios/registro-nombre");
	},

	altaFormNombre: (req,res) => {
		return res.render('0-Usuarios', {
			link: req.originalUrl,
			titulo: "Registro de Nombre"
		});
	},

	altaGuardarNombre: (req,res) => {

	},

	detalle: (req, res) => {
		let BD = leer(ruta_nombre);		
		let registro = BD.find(n => n.id == req.params.id);
		res.render('detalle', {registro});
	},

	editarForm: (req, res) => {
		let BD = leer(ruta_nombre);		
		let registro = BD.find(n => n.id == req.params.id);
		res.render('editar', {registro});
	},

	editarGuardar: (req, res) => {
		// Obtener el contenido actualizado del registro
		let BD = leer(ruta_nombre);		
		let registro = BD.find(n => n.id == req.params.id);
		const reg_actual = {
			...registro,
			...req.body,
		};
		// Eliminar imagen anterior
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
