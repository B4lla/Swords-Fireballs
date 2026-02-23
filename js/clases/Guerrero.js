import Personaje from './Personaje.js';

export default class Guerrero extends Personaje {
  constructor() {
    super(
      "Guerrero",
      Math.floor(Math.random() * (100 - 60 + 1)) + 60,
      Math.floor(Math.random() * (20 - 10 + 1)) + 10,
      1000,
      500
    );

    this.habilidadEspecial = {
      nombre: "Ataques concentrados",
      danio: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
      usos: 3,
      usosMax: 3
    };
  }
}
