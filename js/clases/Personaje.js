export default class Personaje {
    constructor(nombre, salud, fuerza, costo, reembolso) {
        this.nombre = nombre;
        this.salud = salud;
        this.saludMax = salud;
        this.fuerza = fuerza;
        this.costo = costo;
        this.reembolso = reembolso;
    }
}
