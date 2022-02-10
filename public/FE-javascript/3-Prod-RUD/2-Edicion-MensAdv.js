window.addEventListener("load", () => {
	// Variables de pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");
	// Variables de íconos 'se perderán los cambios'
	let salir = document.querySelector("#cuerpo #flechas .fa-arrow-alt-circle-left");
	let edicion = document.querySelector("#cuerpo #flechas .fa-pencil-alt");
	let original = document.querySelector("#cuerpo #flechas .fa-home");

	let guardarCambios = document.querySelector("#cuerpo #flechas .fa-save");
	let eliminar = document.querySelector("#cuerpo #flechas .fa-trash-alt");
	let guardar = document.querySelector("#cuerpo #flechas .fa-check-circle");

	// Continuar
	let continuar = document.querySelector("#cartelAdvertencia .fa-check-circle");

	window.addEventListener("click", (e) => {
		let click = e.target;
		if (click == salir) e.preventDefault();
		// let VF = confirm("¿Querés cambiar el color del título?");
		// VF ? console.log(true) : console.log(false);
		// Prevenir el anchor

		// Obtener el mensaje

		// Incluir el mensaje en el cartel y hacerlo visible

		// else click==edicion
		// 	? tarea="edicion"
		// 	: click=="original"
		// 	? tarea==
	});
});

let funcionLinksRCLV = async (entidad, producto_id) => {
	// Variables generales
	let links = document.querySelectorAll(".input-error i.linkRCLV");

	// Links a Relación con la vida
	for (let i = 0; i < links.length; i++) {
		links[i].addEventListener("click", (e) => {
			// Obtener la entidad_RCLV
			let entidad_RCLV = links[i].className.includes("personaje")
				? "RCLV_personajes_historicos"
				: links[i].className.includes("hecho")
				? "RCLV_hechos_historicos"
				: "RCLV_valores";
			// Para ir a la vista RCLV
			window.location.href =
				"/agregar/relacion-vida/?origen=edicion&entidad=" +
				entidad +
				"&id=" +
				producto_id +
				"&entidad_RCLV=" +
				entidad_RCLV;
		});
	}
};
