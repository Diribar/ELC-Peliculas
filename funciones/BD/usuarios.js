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
	altaMailContrasena: (emailDeUsuario, contrasena) => {
		return entidad.create({
			email: emailDeUsuario,
			contrasena: bcryptjs.hashSync(contrasena, 10),
		});
	},

	agregarDatosPerennes: (id, datos) => {
		return entidad.update({ ...datos }, { where: { id: id } });
	},

	agregarDatosEditables: (id, datos) => {
		return entidad.update({ ...datos }, { where: { id: id } });
	},
	obtenerAutorizadoFA: (id) => {
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
