window.addEventListener("load", () => {
	let contrasena = document.getElementById('contrasena');
	let ojito = document.getElementById('eye');
	ojito.addEventListener("click", () => {
		if (contrasena.type == "password") {
			contrasena.type = "text";
			ojito.classList.remove("fa-eye-slash");
			ojito.classList.add("fa-eye");
		} else {
			contrasena.type = "password";
			ojito.classList.remove("fa-eye");
			ojito.classList.add("fa-eye-slash");
		}
	})
});