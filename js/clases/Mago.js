import Personaje from './Personaje.js';

export default class Mago extends Personaje {
  constructor() {
    super("Mago", Math.floor(Math.random() * (60 - 40 + 1)) + 40, Math.floor(Math.random() * (20 - 10 + 1)) + 10, 2000, 1000);
    
    this.habilidadEspecial = {
      nombre: "Bola de fuego",
      danio: 60,
      usos: 1,
      usosMax: 1
    };
  }
}
