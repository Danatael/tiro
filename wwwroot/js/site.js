document.addEventListener('DOMContentLoaded', function () {
	var yearNode = document.getElementById('y');
	if (yearNode) {
		yearNode.textContent = new Date().getFullYear();
	}

	var cargarMapa = document.getElementById('cargar-mapa');
	if (cargarMapa) {
		cargarMapa.addEventListener('click', function () {
			var iframe = document.createElement('iframe');
			iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15295148.255918471!2d-112.73215502627315!3d20.622046489859745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c7279417fce193%3A0xc1e6513ffb66b023!2sRestaurante%20campestre%20familiar%20LA%20TIROLESA!5e0!3m2!1ses!2smx!4v1792095980449!5m2!1ses!2smx';
			iframe.title = 'Mapa de La Tirolesa';
			iframe.loading = 'lazy';
			iframe.allowFullscreen = true;
			iframe.referrerPolicy = 'strict-origin-when-cross-origin';
			this.parentNode.replaceChild(iframe, this);
		});
	}

	var hero = document.querySelector('.hero');
	if (hero && 'IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			hero.classList.toggle('paused', !entries[0].isIntersecting);
		}).observe(hero);
	}
});
