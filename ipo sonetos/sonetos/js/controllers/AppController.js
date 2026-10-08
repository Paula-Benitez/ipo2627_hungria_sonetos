/**
 * CONTROLADOR: conecta modelos y vista.
 * Flujo de selección: clic → cambia el hash → 'hashchange' → pinta.
 * Un solo camino, y gratis: botón Atrás y enlaces compartibles (index.html#garcilaso-xxiii).
 */
export class AppController {
  #sonetos;
  #preferencias;
  #vista;
  #urlDatos;

  constructor({ sonetos, preferencias, vista, urlDatos }) {
    this.#sonetos = sonetos;
    this.#preferencias = preferencias;
    this.#vista = vista;
    this.#urlDatos = urlDatos;
  }

  async iniciar() {
    this.#aplicarPreferencias();
    this.#enlazarEventos();

    try {
      await this.#sonetos.cargar(this.#urlDatos);
    } catch (error) {
      this.#vista.mostrarError(`No se han podido cargar los sonetos. ${error.message}`);
      return;
    }

    this.#vista.renderIndice(this.#sonetos.indice);
    this.#mostrarDesdeHash();
  }

  #enlazarEventos() {
    this.#vista.alSeleccionar((id) => {
      location.hash = id;
    });
    window.addEventListener("hashchange", () => this.#mostrarDesdeHash());

    this.#vista.alCambiarTexto((delta) => {
      this.#preferencias.cambiarEscala(delta);
      this.#pintarEscala();
    });

    this.#vista.alAlternarTema(() => {
      const nuevo = this.#vista.temaActual() === "oscuro" ? "claro" : "oscuro";
      this.#preferencias.fijarTema(nuevo);
      this.#vista.aplicarTema(nuevo);
    });
  }

  #aplicarPreferencias() {
    this.#vista.aplicarTema(this.#preferencias.tema ?? this.#vista.temaDelSistema());
    this.#pintarEscala();
  }

  #pintarEscala() {
    const p = this.#preferencias;
    this.#vista.aplicarEscala(p.escala, {
      puedeAumentar: p.puedeAumentar,
      puedeReducir: p.puedeReducir,
    });
  }

  #mostrarDesdeHash() {
    const idHash = decodeURIComponent(location.hash.slice(1));
    const soneto = this.#sonetos.obtener(idHash) ?? this.#sonetos.obtener(this.#sonetos.primerId);
    if (!soneto) return;
    this.#vista.marcarActivo(soneto.id);
    this.#vista.mostrarSoneto(soneto);
  }
}
