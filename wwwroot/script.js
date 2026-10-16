// ===== Año dinámico =====
document.getElementById("year").textContent = new Date().getFullYear()

// ===== Header al hacer scroll =====
const header = document.getElementById("header")
const toTop = document.getElementById("toTop")

function onScroll() {
  const y = window.scrollY
  header.classList.toggle("scrolled", y > 40)
  toTop.classList.toggle("show", y > 500)
}
window.addEventListener("scroll", onScroll, { passive: true })
onScroll()

// ===== Menú móvil =====
const navToggle = document.getElementById("navToggle")
const nav = document.getElementById("nav")

function closeNav() {
  nav.classList.remove("open")
  navToggle.classList.remove("active")
  navToggle.setAttribute("aria-expanded", "false")
}

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open")
  navToggle.classList.toggle("active", open)
  navToggle.setAttribute("aria-expanded", String(open))
})

nav.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", closeNav)
})

// ===== Botón volver arriba =====
toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
})

// ===== Animaciones al hacer scroll (reveal) =====
const revealEls = document.querySelectorAll(".reveal")
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // pequeño escalonado para elementos hermanos
        setTimeout(() => entry.target.classList.add("visible"), (i % 4) * 80)
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.15 }
)
revealEls.forEach((el) => observer.observe(el))

// ===== Hero image deferred loading =====
const heroBg = document.querySelector(".hero__bg")
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
const saveData = Boolean(connection && connection.saveData)
const slowConnection = Boolean(connection && /2g/i.test(connection.effectiveType || ""))

if (heroBg) {
  const applyHero = () => {
    const heroImage = heroBg.dataset.bg
    if (heroImage) {
      heroBg.style.backgroundImage = `url("${heroImage}")`
    }
  }

  if (!saveData && !slowConnection) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(applyHero, { timeout: 1200 })
    } else {
      window.addEventListener("load", () => setTimeout(applyHero, 350), { once: true })
    }
  }
}

// ===== Carrusel del menú (bucle infinito) =====
const menuTrack = document.getElementById("menuTrack")

if (menuTrack) {
  const originals = [...menuTrack.children]
  const N = originals.length
  const prevBtn = document.getElementById("menuPrev")
  const nextBtn = document.getElementById("menuNext")
  const dotsBox = document.getElementById("menuDots")
  const carouselEl = menuTrack.closest(".carousel")

  const AUTOPLAY_MS = 2500
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let timer = null
  let settleTimer = null

  // clones: [copia][ORIGINALES][copia]
  const makeClone = (el) => {
    const c = el.cloneNode(true)
    c.setAttribute("aria-hidden", "true")
    c.querySelectorAll("img").forEach((img) => (img.alt = ""))
    return c
  }
  originals.slice().reverse().forEach((el) => menuTrack.prepend(makeClone(el)))
  originals.forEach((el) => menuTrack.append(makeClone(el)))

  const getStep = () => {
    const gap = parseFloat(getComputedStyle(menuTrack).columnGap) || 0
    return originals[0].getBoundingClientRect().width + gap
  }

  // salto instantáneo (sin animación ni snap) para no ver el brinco
  const jumpTo = (left) => {
    menuTrack.style.scrollBehavior = "auto"
    menuTrack.style.scrollSnapType = "none"
    menuTrack.scrollLeft = left
    void menuTrack.offsetWidth
    menuTrack.style.scrollBehavior = ""
    menuTrack.style.scrollSnapType = ""
  }

  // si ya estás en una copia, regresa a la copia del centro
  const normalize = () => {
    const block = N * getStep()
    const x = menuTrack.scrollLeft
    if (x >= block * 2 - 4) jumpTo(x - block)
    else if (x < block - 4) jumpTo(x + block)
  }

  // puntos (uno por card original)
  const dots = originals.map((_, i) => {
    const d = document.createElement("button")
    d.className = "carousel__dot"
    d.setAttribute("aria-label", `Ir al platillo ${i + 1}`)
    d.addEventListener("click", () => {
      menuTrack.scrollTo({ left: (N + i) * getStep(), behavior: "smooth" })
      restartAutoplay()
    })
    dotsBox.appendChild(d)
    return d
  })

  function updateDots() {
    const raw = Math.round(menuTrack.scrollLeft / getStep())
    const idx = (((raw - N) % N) + N) % N
    dots.forEach((d, i) => d.classList.toggle("active", i === idx))
  }

  function onScroll() {
    updateDots()
    clearTimeout(settleTimer)
    settleTimer = setTimeout(normalize, 120) // cuando deja de moverse
  }

  // ----- Autoplay -----
  const next = () => menuTrack.scrollBy({ left: getStep(), behavior: "smooth" })
  const prev = () => menuTrack.scrollBy({ left: -getStep(), behavior: "smooth" })

  function startAutoplay() {
    if (reduceMotion || timer) return
    timer = setInterval(next, AUTOPLAY_MS)
  }
  function stopAutoplay() {
    clearInterval(timer)
    timer = null
  }
  function restartAutoplay() {
    stopAutoplay()
    startAutoplay()
  }

  prevBtn.addEventListener("click", () => { prev(); restartAutoplay() })
  nextBtn.addEventListener("click", () => { next(); restartAutoplay() })

  menuTrack.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", () => jumpTo(N * getStep()))

  menuTrack.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextBtn.click()
    if (e.key === "ArrowLeft") prevBtn.click()
  })

  // pausa al pasar el mouse o tocar
  carouselEl.addEventListener("mouseenter", stopAutoplay)
  carouselEl.addEventListener("mouseleave", startAutoplay)
  carouselEl.addEventListener("focusin", stopAutoplay)
  carouselEl.addEventListener("focusout", startAutoplay)
  carouselEl.addEventListener("touchstart", stopAutoplay, { passive: true })
  carouselEl.addEventListener("touchend", () => setTimeout(startAutoplay, 2000), { passive: true })

  // solo corre cuando se ve en pantalla
  new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? startAutoplay() : stopAutoplay()),
    { threshold: 0.2 }
  ).observe(carouselEl)

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAutoplay() : startAutoplay()
  })

  // arranca en la copia del centro (las cards originales)
  jumpTo(N * getStep())
  updateDots()
}
// ===== Visor de imágenes de la galería =====
const lightbox = document.getElementById("lightbox")

if (lightbox) {
  const galleryImgs = [...document.querySelectorAll(".gallery__grid img")]
  const total = galleryImgs.length
  const lbImg = document.getElementById("lbImg")
  const lbCount = document.getElementById("lbCount")
  const lbClose = document.getElementById("lbClose")
  const lbPrev = document.getElementById("lbPrev")
  const lbNext = document.getElementById("lbNext")
  let current = 0
  let lastFocus = null

  const show = (i) => {
    current = (i + total) % total
    const img = galleryImgs[current]
    lbImg.src = img.currentSrc || img.src
    lbImg.alt = img.alt
    lbCount.textContent = `${current + 1} / ${total}`
    // precarga las vecinas para que el cambio sea instantáneo
    ;[current - 1, current + 1].forEach((j) => {
      new Image().src = galleryImgs[(j + total) % total].src
    })
  }

  const openLightbox = (i) => {
    lastFocus = document.activeElement
    lightbox.hidden = false
    document.body.style.overflow = "hidden"
    show(i)
    lbClose.focus()
  }

  const closeLightbox = () => {
    lightbox.hidden = true
    document.body.style.overflow = ""
    lbImg.removeAttribute("src")
    if (lastFocus) lastFocus.focus()
  }

  // abrir con clic o con Enter/Espacio
  galleryImgs.forEach((img, i) => {
    const fig = img.closest("figure")
    fig.tabIndex = 0
    fig.setAttribute("role", "button")
    fig.setAttribute("aria-label", `Ampliar: ${img.alt}`)
    fig.addEventListener("click", () => openLightbox(i))
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        openLightbox(i)
      }
    })
  })

  lbClose.addEventListener("click", closeLightbox)
  lbPrev.addEventListener("click", () => show(current - 1))
  lbNext.addEventListener("click", () => show(current + 1))

  // clic en el fondo oscuro cierra
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.tagName === "FIGURE") closeLightbox()
  })

  // teclado
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return
    if (e.key === "Escape") closeLightbox()
    if (e.key === "ArrowRight") show(current + 1)
    if (e.key === "ArrowLeft") show(current - 1)
  })

  // deslizar con el dedo en el celular
  let startX = 0
  lightbox.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX }, { passive: true })
  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1))
  }, { passive: true })
}