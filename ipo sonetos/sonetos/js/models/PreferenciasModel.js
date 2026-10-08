/**
 * MODELO de preferencias de lectura (tamaño de texto y tema).
 * Persiste en localStorage; si no está disponible, sigue funcionando en memoria.
 */
const CLAVE = "sonetos:preferencias";

export class PreferenciasModel {
  static ESCALA_MIN = 0.8;
  static ESCALA_MAX = 1.6;

  #datos = { escala: 1, tema: null };

  constructor() {
    try {
      Object.assign(this.#datos, JSON.parse(localStorage.getItem(CLAVE)) ?? {});
    } catch {
      /* sin almacenamiento o JSON corrupto: se usan los valores por defecto */
    }
  }

  get escala() { return this.#datos.escala; }
  get tema() { return this.#datos.tema; }
  get puedeAumentar() { return this.#datos.escala < PreferenciasModel.ESCALA_MAX; }
  get puedeReducir() { return this.#datos.escala > PreferenciasModel.ESCALA_MIN; }

  cambiarEscala(delta) {
    const { ESCALA_MIN, ESCALA_MAX } = PreferenciasModel;
    const nueva = Math.round((this.#datos.escala + delta * 0.1) * 100) / 100;
    this.#datos.escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, nueva));
    this.#guardar();
  }

  fijarTema(tema) {
    this.#datos.tema = tema;
    this.#guardar();
  }

  #guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(this.#datos));
    } catch {
      /* ignorar */
    }
  }
}
