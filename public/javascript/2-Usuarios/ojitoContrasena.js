window.addEventListener("load", () => {
	function mostrar(id, ojo) {
		var bloque = document.getElementById(id);
		var ojito = document.getElementById(ojo);
		if (bloque.type == "password") {
			bloque.type = "text";
			ojito.classList.remove("fa-eye-slash");
			ojito.classList.add("fa-eye");
		} else {
			bloque.type = "password";
			ojito.classList.remove("fa-eye");
			ojito.classList.add("fa-eye-slash");
		}
	}
});