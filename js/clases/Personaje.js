export default class Personaje {
    constructor(nombre, salud, fuerza, costo, reembolso) {
        this.nombre = nombre;
        this.salud = salud;
        this.saludMax = salud;
        this.fuerza = fuerza;
        this.costo = costo;
        this.reembolso = reembolso;
    }

    setSalud(nuevaSalud) {
        nuevaSalud = Number(nuevaSalud);

        if (!Number.isFinite(nuevaSalud)) {
            throw new Error("La salud debe ser un número válido.");
        }

        this.salud = Math.floor(nuevaSalud);
        this.normalizarSalud();
    }

    setSaludMax(nuevaSaludMax, mantenerPorcentaje = true) {
        nuevaSaludMax = Number(nuevaSaludMax);

        if (!Number.isFinite(nuevaSaludMax) || nuevaSaludMax <= 0) {
            throw new Error("La salud máxima debe ser un número mayor que 0.");
        }

        if (mantenerPorcentaje) {
            const porcentajeActual = this.saludMax > 0 ? this.salud / this.saludMax : 1;
            this.saludMax = Math.floor(nuevaSaludMax);
            this.salud = Math.floor(this.saludMax * porcentajeActual);
        } else {
            this.saludMax = Math.floor(nuevaSaludMax);
        }

        this.normalizarSalud();
    }

    recibirDaño(cantidad) {
        this.setSalud(this.salud - cantidad);
    }

    curar(cantidad) {
        this.setSalud(this.salud + cantidad);
    }

    curarPorcentaje(porcentaje) {
        this.setSalud(this.saludMax * porcentaje);
    }

    normalizarSalud() {
        this.salud = Math.max(0, Math.min(this.salud, this.saludMax));
    }

    getPorcentajeSalud() {
        if (!this.saludMax || this.saludMax <= 0) return 0;
        return Math.max(0, Math.min(100, (this.salud / this.saludMax) * 100));
    }
}
