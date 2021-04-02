// ************ Requires ************
const fs = require('fs');
const path = require('path')
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/usuarios.json');
const BDpaises = path.join(__dirname, '../../bases_de_datos/tablas/paises.json');
const BDestados = path.join(__dirname, '../../bases_de_datos/tablas/estado_eclesial.json');
const imagesPath = path.join(__dirname, "../public/images/users/");

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};
function sanitizarFecha(n) {return n.slice(-2)+"/"+n.slice(5,7)+"/"+n.slice(0,4)}
function borrarArchivoDeImagen(n) {let imageFile = path.join(imagesPath, n);if (n && fs.existsSync(imageFile)) {fs.unlinkSync(imageFile);}}

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
			activo: false,
			formNombre: false,
			formSobrenombre: false,
		};
		// Guardar el registro
		BD.push(nuevoUsuario);
		guardar(ruta_nombre, BD);
		delete nuevoUsuario.contrasena;
		// Login
		req.session.usuario = nuevoUsuario;
		// Redireccionar
		return res.redirect("/usuarios/redireccionar");
	},

	redireccionar: (req,res) => {
		let usuario = req.session.usuario;		
		// Redireccionar
		// if !usuarioEnBD.activo {}
		if (!usuario.formNombre) {return res.redirect("/usuarios/registro-nombre")};
		if (!usuario.formSobrenombre) {return res.redirect("/usuarios/registro-sobrenombre")};
		req.session.registroCompleto = true
		return res.send("Usuario registrado en forma completa");
	},

	altaFormNombre: (req,res) => {
		//return res.send([req.session.usuario,"linea 68"]);
		return res.render('0-Usuarios', {
			link: req.originalUrl,
			errorDeAno: null,
			usuario: req.session.usuario,
			titulo: "Registro de Nombre"
		});
	},

	altaGuardarNombre: (req,res) => {
		// Datos del usuario
		let usuario = req.session.usuario;
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Verificar que la fecha sea razonable
		let ano = parseInt(req.body.fechaNacimiento.slice(0,4));
		let max = new Date().getFullYear()-10;
		let min = new Date().getFullYear()-100;
		ano>max || ano<min ? errorDeAno = "¿Estás seguro de que introdujiste la fecha correcta?" : errorDeAno = null;
		// Verificar si existe algún error de validación
		if (validaciones.errors.length>0 || !!errorDeAno) {
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
		let usuarioEnBD = BD.find(n => n.id == usuario.id);
		let indice = BD.findIndex(n => n.id == usuario.id)
		let fecha = sanitizarFecha(req.body.fechaNacimiento);
		const actualizado = {
			...usuarioEnBD,
			...req.body,
			fechaNacimiento: fecha,
			formNombre: true,
		};
		// Guardar el registro
		BD[indice] = actualizado
		guardar(ruta_nombre, BD);
		// Actualizar los datos en la sesión
		req.session.usuario = actualizado;
		res.redirect("/usuarios/redireccionar");
	},

	altaFormSobrenombre: (req,res) => {
		//return res.send([req.session.usuario,"linea 68"]);
		return res.render('0-Usuarios', {
			link: req.originalUrl,
			usuario: req.session.usuario,
			paises: leer(BDpaises),
			estados: leer(BDestados),
			titulo: "Registro de Sobrenombre"
		});
	},

	altaGuardarSobrenombre: (req,res) => {
		//res.send("estoy en Guardar Sobrenombre")
		// Datos del usuario
		let usuario = req.session.usuario;
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Verificar si existe algún error de validación
		if (validaciones.errors.length>0) {
			// Borrar el archivo de imagen guardado
			if (req.file) {BorrarArchivoDeImagen(req.file.filename)}
			// Regresar al formulario
			return res.render('0-Usuarios', {
				link: req.originalUrl,
				usuario,
				errores: validaciones.mapped(),
				data_entry: req.body,
				paises: leer(BDpaises),
				estados: leer(BDestados),
				Fecha: new Date().toLocaleDateString('es-ES'),
				Hora: new Date().toLocaleTimeString('es-ES').slice(0,-3),
				titulo: "Registro de Sobrenombre"
			});
		};
		// Preparar el registro para almacenar
		let BD = leer(ruta_nombre);
		let usuarioEnBD = BD.find(n => n.id == usuario.id);
		let indice = BD.findIndex(n => n.id == usuario.id)
		const actualizado = {
			...usuarioEnBD,
			...req.body,
			imagen: req.file.filename,
			Fecha: new Date().toLocaleDateString('es-ES'),
			Hora: new Date().toLocaleTimeString('es-ES').slice(0,-3),
			formSobrenombre: true,
		};
		// Guardar el registro
		BD[indice] = actualizado
		guardar(ruta_nombre, BD);
		// Actualizar los datos en la sesión
		req.session.usuario = actualizado;
		res.redirect("/usuarios/redireccionar");
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
		req.session.destroy();
		guardar(ruta_nombre, nuevaBD)
		res.redirect("/");
	},

};
