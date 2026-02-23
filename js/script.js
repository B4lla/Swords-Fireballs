// Importacion de modulos
import * as Utils from "./utils.js";
import * as Juego from "./juego.js";
import * as Funciones from "./funciones.js";

// Variables de estado
let state = {
  menu: "menu",
  dificultad: "facil",
};

// Menu principal
// Genera los botones dinamicamente de ambas vistas
function menu() {
  if (state.menu === "menu") {
    const panel = document.getElementById("home-ui");
    panel.innerHTML += Utils.boton("btn-nuevaPartida", "Nueva Partida");
    panel.innerHTML += Utils.boton("btn-cargarPartida", "Cargar Partida");
    panel.innerHTML += `<div class="flex gap-2 w-[min(86vw,22rem)]">
      ${Utils.botonPequeno("btn-facil", "Fácil", state.dificultad === 'facil')}
      ${Utils.botonPequeno("btn-dificil", "Difícil", state.dificultad === 'dificil')}
    </div>`;
  } else if (state.menu === "base") {
    const navbar = document.getElementById("navbar-ui");
    navbar.innerHTML += Utils.boton("btn-verEjercito", "VER EJERCITO");
    navbar.innerHTML += Utils.boton("btn-reclutar", "RECLUTAR");
    navbar.innerHTML += Utils.boton("btn-combatir", "COMBATIR");
    navbar.innerHTML += Utils.boton("btn-despedir", "DESPEDIR");
    navbar.innerHTML += Utils.boton("btn-informacion", "INFORMACION");


    const panelMenu = document.getElementById("home-stage");
    panelMenu.classList.add("hidden");
  } else if (state.menu === "fight") {
  }
}

// Inicializar menú cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", menu);
} else {
  menu();
}

// Handler global para todos los botones
// Si existen los botones los obtendrá
// Además si hay muchos botones con un ID parecido como los de recuperacion --
// -- los obtendrá sin añadirlos 1 a 1
document.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-action]");
  if (!boton) return;

  const action = boton.dataset.action;

  switch (action) {
    case "btn-nuevaPartida":
      Juego.nuevaPartida(state.dificultad);
      state.menu = "base";
      menu();
      break;
    case "btn-cargarPartida":
      if (Juego.cargarPartida()) {
        state.menu = "base";
        menu();
      } else {
        Utils.notificacion("Error", "No se encontró ninguna partida guardada.");
      }
      break;
    case "btn-verEjercito":
      Funciones.verEjercito();
      break;
    case "btn-reclutar":
      Funciones.reclutar();
      break;
    case "btn-despedir":
      Funciones.despedir();
      break;
    case "btn-informacion":
      Funciones.informacion();
      break;
    case "btn-guardar":
      Juego.guardarPartida();
      Utils.notificacion("Guardar", "Partida guardada exitosamente.");
      break;
    case "btn-salir":
      state.menu = "menu";
      Funciones.salirSinGuardar();
      menu();
      break;
    case "btn-combatir":
      if (Juego.Juego.jugador.ejercito.length === 0) {
        Utils.notificacion(
          "Error",
          "No puedes combatir sin tropas. Recluta algunas tropas antes de intentar combatir.",
        );
        return;
      } else {
        Juego.Juego.estado = "fight";
        state.menu = "fight";
        Funciones.combatir();
      }
      break;
    case "btn-facil":
      state.dificultad = "facil";
      actualizarBotonesDificultad();
      break;
    case "btn-dificil":
      state.dificultad = "dificil";
      actualizarBotonesDificultad();
      break;
    case "btn-atacar":
      Funciones.siguienteCombate();
      break;
    case "btn-volver-base":
      document.getElementById("battle-screen").classList.add("hidden");
      document.getElementById("battle-combat").classList.add("hidden");
      document.getElementById("battle-victory").classList.add("hidden");
      document.getElementById("battle-defeat").classList.add("hidden");
      document.getElementById("navbar").classList.remove("hidden");
      document.getElementById("background").style.backgroundImage = "url('./assets/images/bg.png')";
      Juego.Juego.estado = "base";
      state.menu = "base";
      break;
    case "btn-menu-principal":
      state.menu = "menu";
      Funciones.salirSinGuardar();
      menu();
      break;
    default:
      // Obtiene todos los botones que empiezen por ese ID
      if (e.target.id?.startsWith('btn-tropa-recuperacion-')) {
        // Obtiene el ID
        // .pop obtiene el ultimo elemento del array que se forma al hacer el split, que es el ID de la tropa
        const id = parseInt(e.target.closest('button').id.split('-').pop());
        console.log(`Recuperando tropa ${id}`);
        Funciones.recuperarTropa(id);
        Funciones.verEjercito();
      }
      break;
    }
});

// Funcion para alternar la dificultad del juego
function actualizarBotonesDificultad() {
  const container = document.querySelector('.flex.gap-2');
  if (container) {
    container.innerHTML = `
      ${Utils.botonPequeno("btn-facil", "Fácil", state.dificultad === 'facil')}
      ${Utils.botonPequeno("btn-dificil", "Difícil", state.dificultad === 'dificil')}
    `;
  }
}



// En tu script.js, al principio
async function cargarSecciones() {
    try {
        const baseResponse = await fetch('./base.html');
        const baseHTML = await baseResponse.text();
        
        const combateResponse = await fetch('./combate.html');
        const combateHTML = await combateResponse.text();
        
        // Extrae solo el contenido del body
        const baseContent = new DOMParser().parseFromString(baseHTML, 'text/html').body.innerHTML;
        const combateContent = new DOMParser().parseFromString(combateHTML, 'text/html').body.innerHTML;
        
        // Inserta en index.html
        document.body.insertAdjacentHTML('beforeend', baseContent);
        document.body.insertAdjacentHTML('beforeend', combateContent);
        
    } catch (error) {
        console.error('Error al cargar secciones:', error);
    }
}

// Llamalo al cargar la página
document.addEventListener('DOMContentLoaded', cargarSecciones);

function mostrarSeccion(seccionId) {
    // Oculta todas
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('base-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.add('hidden');
    
    // Muestra la que quieres
    document.getElementById(seccionId).classList.remove('hidden');
}

// Eventos de botones
document.addEventListener('click', (e) => {
    if (e.target.id === 'btnJugar') mostrarSeccion('base-screen');
    if (e.target.id === 'btnCombate') mostrarSeccion('battle-screen');
    if (e.target.id === 'btnVolver') mostrarSeccion('home-screen');
});