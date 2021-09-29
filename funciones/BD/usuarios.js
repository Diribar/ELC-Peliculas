const db = require("../../base_de_datos/modelos");
const entidad = db.usuarios;
const bcryptjs = require("bcryptjs");

module.exports = {
	AveriguarSiYaEnBD: (email) => {
		return entidad
			.findOne({
				where: { email: email },
			})
			.then((n) => {
				return n != null ? true : false;
			});
	},
	obtenerPorId: (id) => {
		return entidad.findByPk(id, {
			include: [
				"rol_usuario",
				"sexo",
				"status_registro",
				"pais",
				"estado_eclesial",
			],
		});
	},
	obtenerPorMail: (email) => {
		return entidad.findOne({
			where: { email: email },
			include: [
				"rol_usuario",
				"sexo",
				"status_registro",
				"pais",
				"estado_eclesial",
			],
		});
	},
	actualizarStatusUsuario: (id, st) => {
		return entidad.update(
			{ status_registro_id: st },
			{ where: { id: id } }
		);
	},
	altaMail: (emailDeUsuario, contrasena) => {
		//let contrasena = "1234567890";
		return entidad.create({
			email: emailDeUsuario,
			contrasena: bcryptjs.hashSync(contrasena, 10),
		});
	},
	datosPerennes: (id, datos) => {
		return entidad.update(
			{...datos},
			{ where: { id: id } }
		);
	},
	datosEditables: (id, datos) => {
		return entidad.update(
			{
				apodo: datos.apodo,
				pais_id: datos.pais_id,
				estado_eclesial_id: datos.estado_eclesial_id,
				avatar: datos.avatar,
			},
			{ where: { id: id } }
		);
	},
	autorizadoFA: (id) => {
		return entidad.findByPk(id).then((n) => n.autorizado_fa);
	},
	///////////////////////////////////////////////////////////////////////
	editar: (id, infoUsuario, fileName) => {
		return entidad.update(
			{
				nombre: infoUsuario.nombre,
				apellido: infoUsuario.apellido,
				email: infoUsuario.email,
				contrasena: bcryptjs.hashSync(infoUsuario.contrasena, 10),
				avatar: fileName,
			},
			{ where: { id: id } }
		);
	},
	eliminar: (id, usuario) => {
		return entidad.update(
			{
				borrado: true,
				actualizado_por: usuario,
			},
			{ where: { id: id } }
		);
	},
	obtenerAvatar: async (id) => {
		let usuario = await entidad.findByPk(id);
		return usuario.avatar;
	},
};
