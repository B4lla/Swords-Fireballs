import Personaje from './Personaje.js';

export default class Ladron extends Personaje {
  constructor() {
    super( "Ladrón", 
    Math.floor(Math.random() * (80 - 50 + 1)) + 50, 
    Math.floor(Math.random() * (20 - 10 + 1)) + 10, 1500, 750);

    this.habilidadEspecial = {
      nombre: "Esquivas",
      usos: 2,
      usosMax: 2,
      probEsquivar: 0.35
    };
  }
}
