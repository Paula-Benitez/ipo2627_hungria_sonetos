/**
 * MODELO de sonetos: almacén de datos + reglas del dominio.
 * No conoce el DOM ni la vista.
 */
export class SonetoModel {
  #sonetos = [];

  async cargar(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`No se pudo leer el almacén (${respuesta.status})`);
    const datos = await respuesta.json();
    datos.forEach(SonetoModel.#validar);
    this.#sonetos = datos;
  }

  /** Estructura mínima para pintar el índice (sin los versos). */
  get indice() {
    return this.#sonetos.map(({ id, titulo, autor }) => ({ id, titulo, autor }));
  }

  get primerId() {
    return this.#sonetos[0]?.id ?? null;
  }

  obtener(id) {
    return this.#sonetos.find((soneto) => soneto.id === id) ?? null;
  }

  /** Regla del dominio: 2 cuartetos de 4 versos + 2 tercetos de 3 versos. */
  static #validar(soneto) {
    const estrofasOk = (estrofas, nEstrofas, nVersos) =>
      Array.isArray(estrofas) &&
      estrofas.length === nEstrofas &&
      estrofas.every((e) => Array.isArray(e) && e.length === nVersos);

    if (!estrofasOk(soneto.cuartetos, 2, 4) || !estrofasOk(soneto.tercetos, 2, 3)) {
      throw new Error(`"${soneto.id}" no tiene la estructura de un soneto (4-4-3-3)`);
    }
  }
}
