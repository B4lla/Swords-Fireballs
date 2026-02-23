// Importaciones de clases y Utils
import * as Utils from './utils.js';
import Guerrero from './clases/Guerrero.js';
import Mago from './clases/Mago.js';
import Ladron from './clases/Ladron.js';

// Estado global del juego
export let Juego = {
    estado: 'menu',                     // menu, base, fight
    dificultad: '',                     // facil, dificil
    jugador: {      
        ejercito: [],                   // Array ejercito, maximo 5
        oro: 1000,                      // Oro del jugador
        victorias: 0,                   // Victorias del jugador
        derrotas: 0,                    // Derrotas del jugador
        intentosContratar: 3,           // Intentos restantes contratar
        recuperacionDisponible: true    // Recuperacion disponible?
    },
    enemigos: [],                       // Array enemigos
    tropasTienda: [],                   // Array tropas disponibles en tienda
    turno: 0                            // 0 para jugador, 1 para enemigo
}

// Funcion para cargar partida
export function cargarPartida() {
    // Comprueba si tiene una partida guardada
    let partidaGuardada = Utils.getCookies("juego_guardado");

    if (partidaGuardada) {
        // Si existe una partida la carga y cambia el estado
        Juego = JSON.parse(partidaGuardada);
        
        Juego.estado = Juego.estado || 'base';
        return true;
        
    } else {
        Utils.notificacion("Error", "No se encontró ninguna partida guardada.");
        return false;
    }
}

// Funcion para guardar partida
export function guardarPartida() {
    // La convierte en un JSON y la guarda por 7 dias
    Utils.guardarCookies("juego_guardado", JSON.stringify(Juego), 7);
}

// Funcion para crear una nueva partida
export function nuevaPartida(dificultad) {
    // Establece el estado inicial dependiendo de la dificultad
    Juego.estado = 'base';
    Juego.dificultad = dificultad;
    Juego.jugador.oro = 5000;
    if (dificultad === "facil") {
        
        Juego.jugador.intentosContratar = 5;
    } else if (dificultad === "dificil") {
        Juego.jugador.oro = 1000;
        Juego.jugador.intentosContratar = 3;
    }
    return Juego;
}

// Funcion para generar la tienda aleatoria
export function generarTienda() {
    // Genera las tropas aleatorias con generarTropa del tipo generarUnidad
    if (Juego.jugador.intentosContratar > 0) {
        Juego.tropasTienda = [
            generarTropa(generarUnidad()),
            generarTropa(generarUnidad()),
            generarTropa(generarUnidad())
        ];
        return Juego.tropasTienda;
    } else {
        Utils.notificacion("Tienda", "No puedes contratar tropas en este momento. Intenta de nuevo después de tu próxima batalla.");
    }
}

// Funcion para generar unidades de forma aleatoria
function generarUnidad() {
    const probabilidad = Math.random();
    let elegido = null;
    if (probabilidad <= 0.2) {
        elegido = "mago";
    } else if (probabilidad <= 0.5) {
        elegido = "ladron";
    } else {
        elegido = "guerrero";
    }
    return elegido;
}

// Funcion para generar tropas con un tipo
function generarTropa(tipo) {
    let tropa = null;
    switch (tipo) {
        case 'guerrero': 
            tropa = new Guerrero();
            break;
        case 'mago':
            tropa = new Mago();
            break;
        case 'ladron':
            tropa = new Ladron();
            break;
        default:
            tropa = new Guerrero();   
    }
    return tropa;
}

// Funcion para reclutar tropas
export function reclutarTropa(tropa) {
    if (Juego.jugador.ejercito.length < 5) {
        Juego.jugador.ejercito.push(tropa);
    }
}

// Funcion para generar enemigos aleatorios de entre 3 y 5
export function generarEnemigo() {
    let cantidadEnemigos = Math.floor(Math.random() * (5-3+1)+3);
    cantidadEnemigos = Math.min(cantidadEnemigos, 5);
    for(let i = 0; i<=cantidadEnemigos-1; i++) {
        Juego.enemigos.push(generarTropa(generarUnidad()));
    }
}
