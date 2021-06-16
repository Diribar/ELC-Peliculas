// ************ Requires ************
const fs = require('fs');
const path = require('path')
const {validationResult} = require('express-validator');
const metodosUsuario = require(path.join(__dirname, "../modelos/BD_usuarios"));
const metodosOtros = require(path.join(__dirname, "../modelos/BD_otros"));

// ************ Variables ************
const rutaImagenes = path.join(__dirname, "../public/imagenes/2-Usuarios/");

// ************ Funciones ************
function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};
function guardar(n, contenido) {fs.writeFileSync(n, JSON.stringify(contenido, null, 2))};
function sanitizarFecha(n) {return n.slice(-2)+"/"+n.slice(5,7)+"/"+n.slice(0,4)}
function borrarArchivoDeImagen(n) {let imageFile = path.join(rutaImagenes, n);if (n && fs.existsSync(imageFile)) {fs.unlinkSync(imageFile);}}

// *********** Controlador ***********
module.exports = {

	altaRedireccionar: (req,res) => {
		let usuario = req.session.usuario;
		//return res.send(usuario)
		let status_usuario = usuario.status_usuario_id.toString()
		// Redireccionar
		if (status_usuario == 1) {return res.redirect("/login")};
		if (status_usuario == 2) {return res.redirect("/usuarios/registro-datos-perennes")};
		if (status_usuario == 3) {return res.redirect("/usuarios/registro-datos-editables")};
		return res.redirect(req.session.urlReferencia)
	},

	altaMailForm: (req, res) => {
		return res.render('1-FormMail', {link: req.originalUrl});
	},
	
	altaMailGuardar: async (req, res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Averiguar si existe el mail en la BD
		if (await metodosUsuario.obtenerPorMail(req.body.email)) {
            validaciones.errors.push({
                msg: "Este mail ya figura en nuestra base de datos",
                param: "email",
            });
        }
		// Si existe algún error de validación --> regresar al formulario
		if (validaciones.errors.length > 0) {
			return res.render('1-FormMail', {
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
			});
		};
        // Si no hubieron errores de validación...
		// Guardar el registro
        await metodosUsuario.altaMail(req.body.email);
		// Obtener los datos del usuario
		req.session.usuario = await metodosUsuario.obtenerPorMail(req.body.email);
		// Redireccionar
		//return res.send(req.session.usuario)
		return res.redirect("/usuarios/redireccionar");
	},

	altaPerennesForm: (req,res) => {
		return res.render('2-FormPerennes', {link: req.originalUrl});
	},

	altaPerennesGuardar: async (req,res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Verificar que la fecha sea razonable
		let ano = parseInt(req.body.fechaNacimiento.slice(0,4));
		let max = new Date().getFullYear()-10;
		let min = new Date().getFullYear()-130;
		if (ano>max || ano<min) {
			validaciones.errors.push({
				msg: "¿Estás seguro de que introdujiste la fecha correcta?",
				param: "fechaNacimiento",
			});	
		}
		// Verificar si existe algún error de validación
		if (validaciones.errors.length > 0) {
			// Regresar al formulario
			return res.render('2-FormPerennes', {
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
			});
		};
        // Si no hubieron errores de validación...
		// Actualizar el registro
		await metodosUsuario.datosPerennes(req.session.usuario.id, req.body);
		// Actualizar el status de usuario
		await metodosUsuario.upgradeStatusUsuario(req.session.usuario.id, 3)
		// Actualizar los datos del usuario en la sesión
		req.session.usuario = await metodosUsuario.obtenerPorId(req.session.usuario.id);
		// return res.send(req.session.usuario)
		// Redireccionar
		return res.redirect("/usuarios/redireccionar");
	},

	altaEditablesForm: async (req,res) => {
		//return res.send([req.session.usuario,"linea 101"]);
		let habla_hispana = await metodosOtros.listadoCompleto("pais").then(n => n.filter(n => n.idioma == "Spanish"))
		return res.render('3-FormEditables', {
			link: req.originalUrl,
			habla_hispana,
			estados_eclesiales: await metodosOtros.listadoCompleto("estado_eclesial"),
		});
	},

	altaEditablesGuardar: async (req,res) => {
		var usuario = req.session.usuario;
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Verificar si existe algún error de validación
		if (validaciones.errors.length>0) {
			// Borrar el archivo de imagen guardado
			req.file ? borrarArchivoDeImagen(req.file.filename) : null
			// Variables de países
			let habla_hispana = await metodosOtros.listadoCompleto("pais").then(n => n.filter(n => n.idioma == "Spanish"))
			// Regresar al formulario
			return res.render('3-FormEditables', {
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
				habla_hispana,
				estados_eclesiales: await metodosOtros.listadoCompleto("estado_eclesial"),
			});
		};
		// Si no hubieron errores de validación...
		// Actualizar el registro
		req.body.avatar = req.file ? req.file.filename : "-"
		// return res.send(req.body)
		await metodosUsuario.datosEditables(usuario.id, req.body);
		// Actualizar el status de usuario
		await metodosUsuario.upgradeStatusUsuario(usuario.id, 4)
		// Actualizar los datos del usuario en la sesión
		req.session.usuario = await metodosUsuario.obtenerPorId(usuario.id);
		// return res.send(req.session.usuario)
		// Redireccionar
		return res.redirect("/usuarios/redireccionar");
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
