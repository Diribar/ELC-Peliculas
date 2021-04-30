// ************ Requires ************
const fs = require('fs');
const path = require('path')
const bcryptjs = require('bcryptjs')
const {validationResult} = require('express-validator');
const metodosUsuario = require(path.join(__dirname, "../../modelos/BD_usuarios"));

// ************ Variables ************
const ruta_nombre = path.join(__dirname, '../../bases_de_datos/tablas/BDusuarios.json');
const BDpaises = path.join(__dirname, '../../bases_de_datos/tablas/BDpaises.json');
const BDestados = path.join(__dirname, '../../bases_de_datos/tablas/BDestado_eclesial.json');
const imagesPath = path.join(__dirname, "../public/images/users/");

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};
function sanitizarFecha(n) {return n.slice(-2)+"/"+n.slice(5,7)+"/"+n.slice(0,4)}
function borrarArchivoDeImagen(n) {let imageFile = path.join(imagesPath, n);if (n && fs.existsSync(imageFile)) {fs.unlinkSync(imageFile);}}

// *********** Controlador ***********
module.exports = {

	redireccionar: (req,res) => {
		let usuario = req.session.usuario;
		// return res.send(usuario)
		// Redireccionar
		//if (usuario.status_usuario_id = 1) {
			//return res.send("estoy en controlador redireccionar")
			return res.redirect("/login")
		//};
		if (usuario.status_usuario_id = 2) {return res.redirect("/usuarios/registro-nombre")};
		if (usuario.status_usuario_id = 3) {return res.redirect("/usuarios/registro-sobrenombre")};
		return res.redirect("/")
	},

	altaFormMail: (req, res) => {
		return res.render('0-Usuarios', {
			link: req.originalUrl,
			titulo: "Registro de Mail"
		});
	},
	
	altaGuardarMail: async (req, res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Averiguar si existe el mail en la BD
		if (await metodosUsuario.emailExistente(req.body.email)) {
            validaciones.errors.push({
                msg: "Este mail ya figura en nuestra base de datos",
                param: "email",
            });
        }
		// Si existe algún error de validación --> regresar al formulario
		if (validaciones.errors.length > 0) {
			return res.render('0-Usuarios', {
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
				titulo: "Registro de Mail"
			});
		};
        // Si no hubieron errores de validación...
		// Guardar el registro
        await metodosUsuario.altaMail(req.body.email);
		// Obtener los datos del usuario
		req.session.usuario = await metodosUsuario.obtener_el_usuario_a_partir_del_email(req.body.email);
		// Redireccionar
		//return res.send(req.session.usuario)
		return res.redirect("/usuarios/redireccionar");
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
		res.redirect("/usuarios/detalle");
	},	

	baja: (req, res) => {
		let BD = leer(ruta_nombre);
		let nuevaBD = BD.filter(n => n.id != req.params.id)
		req.session.destroy();
		guardar(ruta_nombre, nuevaBD)
		res.redirect("/");
	},

};
