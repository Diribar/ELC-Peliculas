"use strict";
// Variables
const procsCRUD = require("../2.0-Familias/FM-Procesos");
const procsRCLV = require("../2.2-RCLVs/RCLV-FN-Procesos");
const procesos = require("./PR-FN-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// Variables
		const tema = "prodRud";
		const codigo = "detalle";
		const {entidad, id} = req.query;
		const origen = req.query.origen ? req.query.origen : "DTP";
		const usuario = req.session.usuario ? req.session.usuario : null;
		const userID = usuario ? usuario.id : "";
		const autTablEnts = usuario ? usuario.rolUsuario.autTablEnts : false;
		const delLa = comp.obtieneDesdeEntidad.delLa(entidad);
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

		// Obtiene el producto 'Original' y 'Editado'
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion({entidad, entID: id, userID});
		const prodComb = {...original, ...edicion, id}; // obtiene la versión más completa posible del producto

		// Configura el título de la vista
		const nombre = prodComb.nombreCastellano ? prodComb.nombreCastellano : prodComb.nombreOriginal;
		const tituloDetalle = "Detalle" + delLa + entidadNombre;
		const titulo = entidadNombre + " - " + nombre;

		// Info para el bloque Izquierdo
		const {infoGral, actores} = procesos.bloqueIzq(prodComb);
		const bloqueIzq = {infoGral, actores};

		// RCLV
		const entidadesRCLV = variables.entidades.rclvs;
		const RCLVs = entidadesRCLV.map((n) => ({
			entidad: n,
			campo_id: comp.obtieneDesdeEntidad.campo_id(n),
			asociacion: comp.obtieneDesdeEntidad.asociacion(n),
		}));
		const rclvs_id = variables.entidades.rclvs_id;
		const asocs = variables.entidades.asocRclvs;
		for (let i = 0; i < asocs.length; i++)
			if (prodComb[rclvs_id[i]] != 1)
				bloqueIzq[asocs[i]] = procsRCLV.detalle.bloqueRCLV({entidad: entidadesRCLV[i], ...prodComb[asocs[i]]});
		const rclvsNombre = variables.entidades.rclvsNombre;

		// Info para el bloque Derecho
		const bloqueDer = {producto: true, registro: await procsCRUD.bloqueRegistro({...prodComb, entidad})};
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Lecturas de BD
		if (entidad == "capitulos") {
			prodComb.capitulos = BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
			prodComb.colecAprob = BD_genericas.obtienePorIdConInclude("capitulos", id, "coleccion").then((n) =>
				aprobados_ids.includes(n.coleccion.statusRegistro_id)
			);
		}
		let links = procesos.obtieneLinksDelProducto({entidad, id, userID, autTablEnts, origen});
		let interesDelUsuario = userID ? procesos.obtieneInteresDelUsuario({usuario_id: userID, entidad, entidad_id: id}) : "";
		let yaCalificada = userID
			? BD_genericas.obtienePorCondicion("calRegistros", {usuario_id: userID, entidad, entidad_id: id}).then((n) => !!n)
			: "";
		[prodComb.capitulos, prodComb.colecAprob, links, interesDelUsuario, yaCalificada] = await Promise.all([
			prodComb.capitulos,
			prodComb.colecAprob,
			links,
			interesDelUsuario,
			yaCalificada,
		]);

		// Obtiene datos para la vista
		const status_id = original.statusRegistro_id;
		const revisorPERL = usuario && usuario.rolUsuario.revisorPERL;
		const creadoPor_id = prodComb.creadoPor_id;
		const iconoDL = "fa-circle-info";
		const iconoDB = "fa-chart-line";

		// Va a la vista
		// return res.send(links);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, tituloDetalle, titulo, origen, revisorPERL},
			...{entidad, id, familia: "producto", status_id, creadoPor_id},
			...{entidadNombre, registro: prodComb, links, interesDelUsuario, yaCalificada},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			...{bloqueIzq, bloqueDer, RCLVs, asocs, rclvsNombre},
			...{iconosMobile: true, iconoDL, iconoDB},
		});
	},
	edicion: {
		form: async (req, res) => {
			// Variables
			const tema = "prodRud";
			const codigo = "edicion";
			const {entidad, id} = req.query;
			const userID = req.session.usuario.id;

			// Procesa la session y cookie
			const session = req.session.edicProd && req.session.edicProd.entidad == entidad && req.session.edicProd.id == id;
			const cookie = req.cookies.edicProd && req.cookies.edicProd.entidad == entidad && req.cookies.edicProd.id == id;
			const edicSession = session ? req.session.edicProd : cookie ? req.cookies.edicProd : "";

			// Obtiene la versión más completa posible del producto
			const [original, edicion] = await procsCRUD.obtieneOriginalEdicion({entidad, entID: id, userID});
			const prodComb = {...original, ...edicion, ...edicSession, id};
			if (entidad == "capitulos")
				prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada); //

			// Datos Duros
			const camposInput = variables.camposDD.filter((n) => n[entidad] || n.productos).filter((n) => n.campoInput);
			const camposInput1 = camposInput.filter((n) => n.campoInput == 1);
			const camposInput2 = camposInput.filter((n) => n.campoInput == 2);
			const imgDerPers = procsCRUD.obtieneAvatar(original, {...edicion, ...edicSession});

			// Datos Adicionales
			const camposDA = await variables.camposDA_conValores(userID);
			const gruposPers = procsCRUD.grupos.pers(camposDA);
			const gruposHechos = procsCRUD.grupos.hechos(camposDA);

			// Otros datos para la vista
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			const titulo =
				(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
				" de" +
				(entidad == "capitulos" ? " un " : " la ") +
				entidadNombre;
			const status_id = original.statusRegistro_id;
			const paisesTop5 = [...paises].sort((a, b) => b.cantProds - a.cantProds).slice(0, 5);
			const paisesNombre = original.paises_id ? comp.paises_idToNombre(original.paises_id) : "";
			const familia = "producto";
			const registro = prodComb;
			const dataEntry = prodComb;
			const prodEdic = true;
			const origen = req.query.origen;

			// Va a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, origen, prodEdic, imgDerPers, status_id},
				...{entidadNombre, entidad, id, familia, registro, dataEntry, camposInput1, camposInput2},
				...{paises, paisesTop5, idiomas, paisesNombre, camposDA, gruposPers, gruposHechos},
				...{estrucPers: true, cartelGenerico: true},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, origen} = req.query;
			const usuario = req.session.usuario;
			const userID = usuario.id;
			const revisorPERL = usuario.rolUsuario.revisorPERL;
			const entidadIdOrigen = "?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "");
			const camposCheckBox = variables.camposDA.filter((n) => n.chkBox).map((n) => n.nombre);

			// Reemplaza valores
			for (let prop in req.body)
				if (!req.body[prop]) req.body[prop] = null; // elimina los campos vacíos
				else if (req.body[prop] == "on") req.body[prop] = "1"; // corrige el valor de los checkbox
				else if (typeof req.body[prop] == "string") req.body[prop] = req.body[prop].trim(); // pule los espacios innecesarios
			for (let campo of camposCheckBox) if (!Object.keys(req.body).includes(campo)) req.body[campo] = "0"; // completa el valor de los checkbox

			// Si recibimos un avatar, se completa la información
			if (req.file) {
				req.body.avatar = req.file.filename;
				req.body.avatarUrl = req.file.originalname;
				req.body.tamano = req.file.size;
			}

			// Obtiene el producto 'Original' y 'Editado'
			let [original, edicion] = await procsCRUD.obtieneOriginalEdicion({entidad, entID: id, userID, excluirInclude: true});
			const avatarEdicInicial = edicion.avatar;
			if (original.capitulos) delete original.capitulos;

			// Averigua si corresponde actualizar el original
			const actualizaOrig =
				revisorPERL && // tiene que ser un revisorPERL
				original.statusRegistro_id == creadoAprob_id && // el registro debe estar en el status 'creadoAprob'
				!edicion.id; // no debe tener una edición

			// Averigua si hay errores de validación
			// 1. Se debe agregar el id del original, para verificar que el registro no está repetido
			// 2. Se debe agregar la edición, para que aporte su campo 'avatar'
			let prodComb = {...original, ...edicion, ...req.body, id};
			prodComb.epocaOcurrencia = revisorPERL; // si es un revisorPERL, agrega la obligatoriedad de que haya completado los campos 'epocaOcurrencia_id' y 'publico_id'
			prodComb.publico = revisorPERL;
			const errores = await valida.consolidado({datos: {...prodComb, entidad}});

			// Acciones si no hay errores sensibles
			if (!errores.sensible) {
				// Acciones si corresponde actualizar el original
				if (actualizaOrig) {
					// Completa los datos a guardar
					prodComb.altaRevisadaPor_id = userID;
					prodComb.altaRevisadaEn = comp.fechaHora.ahora();

					// Actualiza el registro original
					await BD_genericas.actualizaPorId(entidad, id, prodComb);

					// Actualiza los campos de los capítulos de una colección
					if (entidad == "colecciones") {
						// Variables
						let esperar = [];

						// Rutina por campo - sin 'await' y solo para los campos editados
						for (let prop in req.body)
							if (original[prop] != req.body[prop])
								esperar.push(procsCRUD.transfiereDatos(original, req.body, prop));

						// Espera a que se corran todos los campos
						await Promise.all(esperar);
					}

					// Elimina otras ediciones que tengan los mismos valores
					let edicsEliminadas = procsCRUD.eliminaDemasEdiciones({entidad, original: prodComb, id});

					// Se fija si corresponde cambiar el status
					let statusAprob = procsCRUD.statusAprob({entidad, registro: prodComb});

					// Espera a que se completen las funciones con 'Promise'
					await Promise.all([statusAprob, edicsEliminadas]);

					// Limpia el valor de la edicion, para que no se recargue el url
					edicion = null;
				}
				// De lo contrario, actualiza la edicion
				else {
					// Combina la información
					edicion = {...edicion, ...req.body};
					// Guarda o actualiza la edición, y achica 'edición a su mínima expresión
					edicion = await procsCRUD.guardaActEdic({entidad, original, edicion, userID});
				}

				// Acciones sobre el archivo avatar, si recibimos uno
				if (req.file)
					if (actualizaOrig) {
						// Mueve el archivo de la edición para reemplazar el original
						comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Final");
						// Elimina el anterior archivo de imagen original
						if (original.avatar) comp.gestionArchivos.elimina(carpetaExterna + "2-Productos/Final/", original.avatar);
					} else {
						// Mueve el archivo de la edición para su revisión
						comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Revisar");
						// Elimina el anterior archivo de imagen editada
						if (avatarEdicInicial)
							comp.gestionArchivos.elimina(carpetaExterna + "2-Productos/Revisar/", avatarEdicInicial);
					}

				// Elimina los datos de la session
				delete req.session.edicProd;
			} else {
				// Si recibimos un archivo avatar editado, lo elimina
				if (req.file) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", req.file.filename);

				// Guarda los datos editados, sin el de avatar
				req.session.edicProd = req.body;
				delete req.session.edicProd.avatar;

				// Recarga la vista
				return res.redirect(req.originalUrl);
			}

			// Fin
			return origen == "TE"
				? res.redirect("/inactivar-captura/" + entidadIdOrigen) // Regresa a Revisión
				: res.redirect("/producto/detalle/" + entidadIdOrigen); // Redirige a detalle
		},
	},
	califica: {
		form: async (req, res) => {
			// Variables
			const tema = "prodRud";
			const codigo = "calificar";
			const {entidad, id} = req.query;
			const origen = req.query.origen ? req.query.origen : "";
			const userID = req.session.usuario ? req.session.usuario.id : "";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

			// Obtiene la versión más completa posible del producto
			const [original, edicion] = await procsCRUD.obtieneOriginalEdicion({entidad, entID: id, userID});
			let prodComb = {...original, ...edicion, id};

			// Info para el bloque Derecho
			const bloqueDer = {producto: true, registro: await procsCRUD.bloqueRegistro({...prodComb, entidad})};
			const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

			// Info para la vista
			if (entidad == "capitulos")
				prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
			const titulo = "Calificá " + (entidad == "capitulos" ? "un " : "la ") + entidadNombre;
			const status_id = original.statusRegistro_id;
			const atributosTitulo = ["Deja Huella", "Entretiene", "Calidad Técnica"];
			const condics = {usuario_id: userID, entidad, entidad_id: id};
			const include = ["feValores", "entretiene", "calidadTecnica"];
			const califUsuario = await BD_genericas.obtienePorCondicionConInclude("calRegistros", condics, include);
			const interesDelUsuario = await procesos.obtieneInteresDelUsuario(condics);
			const iconoDL = "fa-chart-simple fa-rotate-90";
			const iconoDB = "fa-chart-line";

			// Ayuda para el título
			const ayudasTitulo = [];
			if ([pppOpcsObj.sinPref.id, pppOpcsObj.laQuieroVer.id].includes(interesDelUsuario.id))
				ayudasTitulo.push("Sólo podés calificar una película si ya la viste.");
			if (interesDelUsuario.id == pppOpcsObj.sinPref.id)
				ayudasTitulo.push("Si la calificás, cambiaremos tu preferencia como 'Ya vista'");
			ayudasTitulo.push("Necesitamos saber TU opinión, no la de otras personas.");

			// Va a la vista
			// return res.send({tema})
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, ayudasTitulo, origen},
				...{entidad, id, familia: "producto", status_id},
				...{entidadNombre, registro: prodComb, interesDelUsuario},
				...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
				...{bloqueDer, atributosTitulo, califUsuario},
				...{iconosMobile: true, iconoDL, iconoDB},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id: entidad_id, feValores_id, entretiene_id, calidadTecnica_id} = {...req.query, ...req.body};
			const userID = req.session.usuario.id;
			let condics;

			// Verifica errores
			const errores = valida.calificar({feValores_id, entretiene_id, calidadTecnica_id});
			if (errores.hay) return res.redirect(req.originalUrl);

			// Obtiene el resultado
			const valores = {usuario_id: userID, entidad, entidad_id, feValores_id, entretiene_id, calidadTecnica_id};
			let resultado = 0;
			for (let criterio of calCriterios) {
				const campo_id = criterio.atributo_id;
				const campo = criterio.atributo;
				const ponderacion = criterio.ponderacion;
				const ID = valores[campo_id];
				const atributoCalif = atributosCalific[campo].find((n) => n.id == ID);
				const valor = atributoCalif.valor;
				resultado += (valor * ponderacion) / 100;
			}
			valores.resultado = Math.round(resultado);

			// Averigua si existe la calificacion
			condics = {usuario_id: userID, entidad, entidad_id};
			const existe = await BD_genericas.obtienePorCondicion("calRegistros", condics);
			existe
				? await BD_genericas.actualizaPorId("calRegistros", existe.id, valores)
				: await BD_genericas.agregaRegistro("calRegistros", valores);

			// Actualiza las calificaciones del producto
			await procesos.actualizaCalifProd({entidad, entidad_id});

			// Actualiza la ppp
			condics = {usuario_id: userID, entidad, entidad_id};
			const interesDelUsuario = await BD_genericas.obtienePorCondicion("pppRegistros", condics);
			const novedades = {usuario_id: userID, entidad, entidad_id, ppp_id: pppOpcsObj.yaLaVi.id};
			interesDelUsuario
				? await BD_genericas.actualizaPorId("pppRegistros", interesDelUsuario.id, novedades)
				: await BD_genericas.agregaRegistro("pppRegistros", novedades);

			// Fin
			return res.redirect(req.originalUrl);
		},
	},
};
