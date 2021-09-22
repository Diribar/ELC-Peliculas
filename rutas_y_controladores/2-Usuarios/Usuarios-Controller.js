// ************ Requires ************
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const BD_usuarios = require(path.join(
	__dirname,
	"../../modelos/base_de_datos/BD_usuarios"
));
const BD_varios = require(path.join(
	__dirname,
	"../../modelos/base_de_datos/BD_varios"
));
const rutaImagenes = path.join(__dirname, "../public/imagenes/2-Usuarios/");
const funciones = require("../../modelos/funcionesVarias");

// *********** Controlador ***********
module.exports = {
	altaRedireccionar: async (req, res) => {
		let usuario = req.session.usuario
			? req.session.usuario
			: req.session.email
			? await BD_usuarios.obtenerPorMail(req.session.email)
			: req.cookies.email
			? await BD_usuarios.obtenerPorMail(req.cookies.email)
			: res.redirect("/");
		//return res.send(usuario)
		let status_registro = usuario.status_registro_id + "";
		// Redireccionar
		//console.log("status_registro: " + status_registro);
		status_registro == 1
			? res.redirect("/login")
			: status_registro == 2
			? res.redirect("/usuarios/datos-perennes")
			: status_registro == 3
			? res.redirect("/usuarios/datos-editables")
			: req.session.urlReferencia
			? res.redirect(req.session.urlReferencia)
			: res.redirect("/");
	},

	altaMailForm: (req, res) => {
		tema = "usuario";
		codigo = "mail";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
		});
	},

	altaMailGuardar: async (req, res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Averiguar si existe el mail en la BD
		mailExistente = await BD_usuarios.mailExistente(req.body.email);
		if (mailExistente) {
			validaciones.errors.push({
				msg: "Este mail ya figura en nuestra base de datos",
				param: "email",
			});
		}
		// Si existe algún error de validación --> regresar al formulario
		if (validaciones.errors.length > 0) {
			tema = "usuario";
			codigo = "mail";
			return res.render("Home", {
				tema,
				codigo,
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
			});
		}
		// Si no hubieron errores de validación...
		// Enviar la contraseña por mail
		asunto = "Contraseña para ELC";
		email = req.body.email;
		codigo = Math.round(Math.random() * Math.pow(10, 10)) + "";
		comentario = "La contraseña del mail " + email + " es: " + codigo;
		funciones.enviarMail(asunto, email, comentario).catch(console.error);
		// Guardar el registro
		await BD_usuarios.altaMail(req.body.email, codigo);
		// Obtener los datos del usuario
		//req.session.usuario = await BD_usuarios.obtenerPorMail(req.body.email);
		req.session.email = req.body.email;
		// Redireccionar
		//return res.send(req.session.usuario)
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaPerennesForm: async (req, res) => {
		!req.session.usuario
			? req.session.usuario = await BD_usuarios.obtenerPorMail(req.cookies.email)
			: ""
		delete req.session["email"]
		tema = "usuario";
		codigo = "perennes";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
		});
	},

	altaPerennesGuardar: async (req, res) => {
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Verificar que la fecha sea razonable
		let ano = parseInt(req.body.fechaNacimiento.slice(0, 4));
		let max = new Date().getFullYear() - 10;
		let min = new Date().getFullYear() - 130;
		if (ano > max || ano < min) {
			validaciones.errors.push({
				msg: "¿Estás seguro de que introdujiste la fecha correcta?",
				param: "fechaNacimiento",
			});
		}
		// Verificar si existe algún error de validación
		if (validaciones.errors.length > 0) {
			// Regresar al formulario
			tema = "usuario";
			codigo = "perennes";
			return res.render("Home", {
				tema,
				codigo,
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
			});
		}
		// Si no hubieron errores de validación...
		// Actualizar el registro
		await BD_usuarios.datosPerennes(req.session.usuario.id, req.body);
		// Actualizar el status de usuario
		await BD_usuarios.actualizarStatusUsuario(req.session.usuario.id, 3);
		// Actualizar los datos del usuario en la sesión
		req.session.usuario = await BD_usuarios.obtenerPorId(
			req.session.usuario.id
		);
		//return res.send(req.session.usuario)
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	altaEditablesForm: async (req, res) => {
		tema = "usuario";
		codigo = "editables";
		let habla_hispana = await BD_varios.ObtenerTodos("paises").then((n) =>
			n.filter((n) => n.idioma == "Spanish")
		);
		let estados_eclesiales = await BD_varios.ObtenerEstadosEclesiales();
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			habla_hispana,
			estados_eclesiales,
		});
	},

	altaEditablesGuardar: async (req, res) => {
		var usuario = req.session.usuario;
		// Verificar si hay errores en el data entry
		let validaciones = validationResult(req);
		// Verificar si existe algún error de validación
		if (validaciones.errors.length > 0) {
			// Borrar el archivo de imagen guardado
			req.file ? borrarArchivoDeImagen(req.file.filename) : null;
			// Variables de países
			let habla_hispana = await BD_varios.ObtenerTodos("paises").then(
				(n) => n.filter((n) => n.idioma == "Spanish")
			);
			// Regresar al formulario
			tema = "usuario";
			codigo = "editables";
			let estados_eclesiales = await BD_varios.ObtenerEstadosEclesiales();
			return res.render("Home", {
				tema,
				codigo,
				link: req.originalUrl,
				errores: validaciones.mapped(),
				data_entry: req.body,
				habla_hispana,
				estados_eclesiales,
			});
		}
		// Si no hubieron errores de validación...
		// Actualizar el registro
		req.body.avatar = req.file ? req.file.filename : "-";
		// return res.send(req.body)
		await BD_usuarios.datosEditables(usuario.id, req.body);
		// Actualizar el status de usuario
		await BD_usuarios.actualizarStatusUsuario(usuario.id, 4);
		// Actualizar los datos del usuario en la sesión
		req.session.usuario = await BD_usuarios.obtenerPorId(usuario.id);
		// return res.send(req.session.usuario)
		// Redireccionar
		return res.redirect("/usuarios/altaredireccionar");
	},

	detalle: (req, res) => {
		tema = "usuario";
		codigo = "detalle";
		let registro = encontrarID(req.params.id);
		res.render("Home", {
			tema,
			codigo,
			registro,
		});
	},

	editarForm: (req, res) => {
		tema = "usuario";
		codigo = "editar";
		let registro = encontrarID(req.params.id);
		res.render("Home", {
			tema,
			codigo,
			registro,
		});
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
			if (BD.image) {
				fs.unlinkSync(path.join(__dirname, RutaDeImagenes, BD.image));
			}
		}
		// Reemplazar el registro con el contenido actual
		let indice = BD.indexOf(registro);
		BD[indice] = reg_actual;
		// Guardar los cambios
		guardar(ruta_nombre, BD);
		res.redirect("/usuarios/detalle");
	},

	baja: (req, res) => {
		let BD = leer(ruta_nombre);
		let nuevaBD = BD.filter((n) => n.id != req.params.id);
		req.session.destroy();
		guardar(ruta_nombre, nuevaBD);
		res.redirect("/");
	},
};

// ************ Funciones ************
leer = (n) => {
	return JSON.parse(fs.readFileSync(n, "utf-8"));
};
guardar = (n, contenido) => {
	fs.writeFileSync(n, JSON.stringify(contenido, null, 2));
};
//function sanitizarFecha(n) {return n.slice(-2)+"/"+n.slice(5,7)+"/"+n.slice(0,4)}
function borrarArchivoDeImagen(n) {
	let archivoImagen = path.join(rutaImagenes, n);
	n && fs.existsSync(archivoImagen) ? fs.unlinkSync(archivoImagen) : "";
}
