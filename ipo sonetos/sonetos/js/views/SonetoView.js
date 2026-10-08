/**
 * VISTA: único módulo que toca el DOM y el CSSOM.
 *  - Ganchos JS = atributos data-* (el CSS usa clases; así se pueden cambiar por separado).
 *  - DOM:   plantillas <template>, textContent (sin innerHTML), replaceChildren.
 *  - CSSOM: style.setProperty('--t-escala'), dataset.tema, matchMedia.
 * No contiene lógica de negocio: expone eventos y métodos de pintado.
 */
const ORDINALES = ["Primer", "Segundo"];

export class SonetoView {
  #doc;
  #raiz;
  #r;

  constructor(doc = document) {
    this.#doc = doc;
    this.#raiz = doc.documentElement;
    this.#r = {
      indice: doc.querySelector("[data-indice]"),
      lector: doc.querySelector("[data-lector]"),
      ajustes: doc.querySelector("[data-ajustes]"),
      botonTema: doc.querySelector('[data-accion="tema"]'),
      botonMas: doc.querySelector('[data-accion="texto-mayor"]'),
      botonMenos: doc.querySelector('[data-accion="texto-menor"]'),
      plIndice: doc.querySelector("#plantilla-indice"),
      plSoneto: doc.querySelector("#plantilla-soneto"),
      plEstrofa: doc.querySelector("#plantilla-estrofa"),
    };
  }

  /* ── Eventos hacia el controlador (delegación) ───────────── */
  alSeleccionar(callback) {
    this.#r.indice.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-id]");
      if (boton) callback(boton.dataset.id);
    });
  }

  alCambiarTexto(callback) {
    this.#r.ajustes.addEventListener("click", (e) => {
      const boton = e.target.closest('[data-accion^="texto"]');
      if (boton) callback(boton.dataset.accion === "texto-mayor" ? 1 : -1);
    });
  }

  alAlternarTema(callback) {
    this.#r.botonTema.addEventListener("click", callback);
  }

  /* ── DOM ─────────────────────────────────────────────────── */
  renderIndice(sonetos) {
    const fragmento = this.#doc.createDocumentFragment();
    for (const { id, titulo, autor } of sonetos) {
      const item = this.#r.plIndice.content.cloneNode(true);
      item.querySelector("button").dataset.id = id;
      item.querySelector('[data-campo="titulo"]').textContent = titulo;
      item.querySelector('[data-campo="autor"]').textContent = autor;
      fragmento.append(item);
    }
    this.#r.indice.replaceChildren(fragmento);
  }

  marcarActivo(id) {
    for (const boton of this.#r.indice.querySelectorAll("[data-id]")) {
      if (boton.dataset.id === id) boton.setAttribute("aria-current", "true");
      else boton.removeAttribute("aria-current");
    }
  }

  mostrarSoneto(soneto) {
    const nodo = this.#r.plSoneto.content.cloneNode(true);
    nodo.querySelector('[data-campo="titulo"]').textContent = soneto.titulo;
    nodo.querySelector('[data-campo="autor"]').textContent = soneto.autor;

    const cuerpo = nodo.querySelector('[data-campo="estrofas"]');
    const contador = { cuarteto: 0, terceto: 0 };
    const estrofas = [
      ...soneto.cuartetos.map((versos) => ({ tipo: "cuarteto", versos })),
      ...soneto.tercetos.map((versos) => ({ tipo: "terceto", versos })),
    ];

    for (const { tipo, versos } of estrofas) {
      const estrofa = this.#r.plEstrofa.content.cloneNode(true);
      const seccion = estrofa.querySelector("section");
      seccion.dataset.tipo = tipo; // gancho para CSS: .estrofa[data-tipo="terceto"]
      estrofa.querySelector("h3").textContent = `${ORDINALES[contador[tipo]++]} ${tipo}`;

      for (const texto of versos) {
        const verso = this.#doc.createElement("p");
        verso.className = "verso";
        verso.textContent = texto;
        seccion.append(verso);
      }
      cuerpo.append(estrofa);
    }

    this.#r.lector.replaceChildren(nodo);
    this.#doc.title = `${soneto.titulo} — ${soneto.autor}`;
    this.#r.lector.focus({ preventScroll: true });

    // CSSOM View: en pantallas estrechas el soneto queda bajo el índice, así que se lleva a la vista.
    if (this.#doc.defaultView.matchMedia("(width < 52rem)").matches) {
      this.#r.lector.scrollIntoView({ block: "start" });
    }
  }

  mostrarError(mensaje) {
    const aviso = this.#doc.createElement("p");
    aviso.className = "aviso";
    aviso.setAttribute("role", "alert");
    aviso.textContent = mensaje;
    this.#r.lector.replaceChildren(aviso);
  }

  /* ── CSSOM ───────────────────────────────────────────────── */
  aplicarEscala(escala, { puedeAumentar, puedeReducir }) {
    this.#raiz.style.setProperty("--t-escala", escala);
    this.#r.botonMas.disabled = !puedeAumentar;
    this.#r.botonMenos.disabled = !puedeReducir;
  }

  aplicarTema(tema) {
    this.#raiz.dataset.tema = tema;
    this.#r.botonTema.setAttribute("aria-pressed", String(tema === "oscuro"));
  }

  temaDelSistema() {
    const oscuro = this.#doc.defaultView.matchMedia("(prefers-color-scheme: dark)").matches;
    return oscuro ? "oscuro" : "claro";
  }

  temaActual() {
    return this.#raiz.dataset.tema;
  }
}
