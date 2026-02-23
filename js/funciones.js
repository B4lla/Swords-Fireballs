// Modulos necesarios
import * as Juego from "./juego.js";
import * as Utils from "./utils.js";

// Variable para controlar el z-index de los paneles
let panelZindex = 100;



//////////////
// INTERFAZ
//////////////


// Funciones para abrir y cerrar paneles
function abrirPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.zIndex = panelZindex++;
    $(panel).fadeToggle(300);

    $(panel)
      .off("mousedown")
      .on("mousedown", function () {
        $(this).css("z-index", panelZindex++);
      });
  }
  return panel;
}

// Función para cerrar todos los paneles abiertos cuando se va a combatir
export function cerrarTodosPaneles() {
  const paneles = [
    "panel-verEjercito",
    "panel-reclutar",
    "panel-despedir",
    "panel-informacion"
  ];
  
  paneles.forEach(panelId => {
    const panel = document.getElementById(panelId);
    if (panel && $(panel).is(":visible")) {
      $(panel).fadeOut(300);
    }
  });
}



//////////////
// VER EJERCITO
//////////////

// Función para actualizar el contenido del panel Ver Ejército
function actualizarContenidoVerEjercito() {
  let idEjercito = 0;
  const contenido = document.getElementById("panel-verEjercito-content");
  contenido.innerHTML = "";
  
  // Agregar botón de recuperar todas las tropas
  const tropasParaRecuperar = Juego.Juego.jugador.ejercito.filter(tropa => tropa.salud <= 0).length > 0;
  if (tropasParaRecuperar) {
    const botonRecuperarTodas = `
      <button id="btn-recuperar-todas" class="relative z-10 group outline-none cursor-pointer transition-transform active:scale-95 filter drop-shadow-[0_4px_3px_rgba(0,0,0,0.5)] w-full max-w-[22rem] min-w-[200px]">
          <div class="scooped-corner bg-[#1a1410] p-[2px] w-full h-[clamp(56px,10vw,76px)]">
              <div class="scooped-corner bg-[#D2B48C] w-full h-full p-[clamp(2px,0.8vw,4px)]">
                  <div class="scooped-corner bg-[#756452] w-full h-full p-[clamp(1px,0.5vw,2px)]">
                      <div class="scooped-corner w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#E4CCA2_20%,_#D2B48C_100%)] py-[clamp(6px,1.8vw,12px)]">
                          <span class="text-[#3e3226] font-['Cinzel'] text-[clamp(0.95rem,2.6vw,1.6rem)] font-medium tracking-wide uppercase pt-[clamp(1px,0.4vw,3px)] select-none">
                              Recuperar tropas
                          </span>
                      </div>
                  </div>
              </div>
          </div>
      </button>
    `;
    contenido.innerHTML += botonRecuperarTodas;
  }
  
  // Agregar las tropas
  Juego.Juego.jugador.ejercito.forEach((element) => {
    contenido.innerHTML += Utils.tropaEjercito(element, idEjercito++);
  });
  
  // Agregar listener al botón de recuperar todas
  const btnRecuperarTodas = document.getElementById("btn-recuperar-todas");
  if (btnRecuperarTodas) {
    btnRecuperarTodas.addEventListener("click", (e) => {
      e.stopPropagation();
      recuperarTodasLasTropas();
      actualizarContenidoVerEjercito(); // Recarga solo el contenido
    });
  }
}

// Funcion para ver el ejercito
// Y recuperar tropas
export function verEjercito() {
  const panelVerEjercito = document.getElementById("panel-verEjercito");

  // Crea el panel para ver el ejercito
  if (!$(panelVerEjercito).is(":visible")) {
    actualizarContenidoVerEjercito();
  }

  // JQueryUI para poder arrastrarlo
  if (!$(panelVerEjercito).hasClass("ui-draggable")) {
    setTimeout(() => {
      $(panelVerEjercito).draggable({
        containment: "body",
        scroll: false,
      });
    }, 50);
  }

  // Por ultimo abre el panel tras ejecutar la logica
  abrirPanel("panel-verEjercito");
}



//////////////
// CARGA ASINCRONA
//////////////

// Funcion para simular la carga de tropas
async function cargarTropaAsincrona(tropa, index) {
  // Tiempo aleatorio entre 2 y 5 para cada tropa
  const tiempoEspera = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
  
  // Resuelve la promesa tras el tiempo
  return new Promise((resolve) => {
    setTimeout(() => {
      const ejercitoLleno = Juego.Juego.jugador.ejercito.length >= 5;
      const loader = document.getElementById(`loader-tropa-${index}`);
      
      if (loader) {
        // Reemplaza el loader por la tropa reclutable al terminar de cargar
        loader.outerHTML = Utils.tropaReclutable(tropa, index, Juego.Juego.jugador.oro, ejercitoLleno);
        // Agregar evento de compra
        const tropaElement = document.getElementById(`btn-tropa-compra-${index}`);
        if (tropaElement) {
          // Listener ademas de la logica para saber cual se recluta y si puede
          tropaElement.addEventListener("click", () => {
            if (Juego.Juego.jugador.ejercito.length >= 5) {
              Utils.notificacion("Compra", `No puedes reclutar a ${tropa.nombre} porque tu ejercito ya tiene 5 tropas.`);
            } else if (Juego.Juego.jugador.oro < tropa.costo) {
              Utils.notificacion("Compra", `No tienes suficiente oro para reclutar a ${tropa.nombre}.`);
            } else {
              Utils.notificacion("Compra", `Has reclutado a ${tropa.nombre}.`);
              Juego.reclutarTropa(Juego.Juego.tropasTienda[index]);
              Juego.Juego.jugador.oro -= tropa.costo;
              actualizarInformacion(); // Actualiza el panel de informacion
              generarTropasReclutar(); // Genera una nueva tienda
              
              // Actualizar panel Ver Ejército si está abierto (sin cerrarlo)
              const panelVerEjercito = document.getElementById("panel-verEjercito");
              if (panelVerEjercito && $(panelVerEjercito).is(":visible")) {
                actualizarContenidoVerEjercito();
              }
            }
          });
        }
      }
      // Resolucion de promesa
      resolve(tropa);
    }, tiempoEspera);
  });
}

//////////////
// FUNCIONES RECLUTAR
//////////////

// Genera las tarjetas de las tropas
async function generarTropasReclutar() {
  const tropasContainer = document.getElementById("tropas-reclutar");
  tropasContainer.innerHTML = "";
  const tropas = Juego.generarTienda();

  if (tropas) {
    Juego.Juego.jugador.intentosContratar--;
    // Mostrar loaders asincronia
    tropas.forEach((tropa, index) => {
      tropasContainer.innerHTML += `
        <div id="loader-tropa-${index}" class="bg-[#D2B48C] border-4 border-[#775732] rounded-lg p-6 w-[min(95vw,28rem)] text-[#2C2318] flex items-center justify-center min-h-[120px]">
          <div class="flex flex-col items-center gap-3">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#775732] border-t-[#CB9039]"></div>
            <p class="text-sm font-semibold">Cargando...</p>
          </div>
        </div>
      `;
    });

    // Cargar las 3 tropas a la vez con Promise.all()
    try {
      await Promise.all([
        cargarTropaAsincrona(tropas[0], 0),
        cargarTropaAsincrona(tropas[1], 1),
        cargarTropaAsincrona(tropas[2], 2)
      ]);
    } catch (error) {
      console.error(`Error al cargar las tropas:`, error);
      Utils.notificacion("Error", `Hubo un problema cargando las tropas.`);
    }
  }
}

// Panel reclutamineto
export function reclutar() {
  const panelReclutar = document.getElementById("panel-reclutar");

  // Si está abierto cierra el panel
  if ($(panelReclutar).is(":visible")) {
    abrirPanel("panel-reclutar");
    return;
  }

  // Comprueba si puede contratar
  if (Juego.Juego.jugador.intentosContratar > 0) {
    // Genera las tropas reclutables
    generarTropasReclutar();

    // JQueryUI para poder arrastrarlo
    if (!$(panelReclutar).hasClass("ui-draggable")) {
      setTimeout(() => {
        $(panelReclutar).draggable({
          containment: "body",
          scroll: false,
        });
      }, 50);
    }

    abrirPanel("panel-reclutar");
  } else {
    Utils.notificacion("Tienda", "No tienes intentos de contratar.");
  }
}





//////////////
// FUNCIONES DESPEDIR
//////////////


// Funcion para despedir
export function despedir() {
  const panelDespedir = document.getElementById("panel-despedir");

  // Comprueba si hay tropas para despedir
  if (Juego.Juego.jugador.ejercito.length === 0) {
    Utils.notificacion("Error", "No tienes tropas para despedir.");
    return;
  }

  if ($(panelDespedir).is(":visible")) {
    abrirPanel("panel-despedir");
    return;
  }

  // Obtengo el contenido del panel para limpiarlo y despues agregar todas mis tropas
  const despedirContent = document.getElementById("panel-despedir-content");
  despedirContent.innerHTML = "";
  Juego.Juego.jugador.ejercito.forEach((tropa, index) => {
    despedirContent.innerHTML += Utils.tropaDespedir(tropa, index);
  });

  // Para cada boton de despedir creo un listener con el index para mas adelante saber cual ha pulsado
  Juego.Juego.jugador.ejercito.forEach((tropa, index) => {
    const tropaElement = document.getElementById(`btn-tropa-despedir-${index}`);
    if (tropaElement) {
      tropaElement.addEventListener("click", function() {
        const tropaADespedir = Juego.Juego.jugador.ejercito[index];
        const oroRecibido = tropaADespedir.reembolso;
        Utils.notificacion("Despido", `Has despedido a ${tropaADespedir.nombre} y recibido ${oroRecibido} de oro.`);
        Juego.Juego.jugador.oro += oroRecibido;
        Juego.Juego.jugador.ejercito.splice(index, 1);
        actualizarInformacion();
        despedir();
      });
    }
  });

  // JQueryUI para poder arrastrarlo
  if (!$(panelDespedir).hasClass("ui-draggable")) {
    setTimeout(() => {
      $(panelDespedir).draggable({
        containment: "body",
        scroll: false,
      });
    }, 50);
  }

  abrirPanel("panel-despedir");
}







//////////////
// FUNCIONES INFORMACION
//////////////

// Actualiza la informacion cada vez que se solicita
export function actualizarInformacion() {
  const informacionContent = document.getElementById(
    "panel-informacion-content",
  );
  if (informacionContent) {
    informacionContent.innerHTML = `
                <p>Oro: ${Juego.Juego.jugador.oro}</p>
                <p>Victorias: ${Juego.Juego.jugador.victorias}</p>
                <p>Derrotas: ${Juego.Juego.jugador.derrotas}</p>
                <p>Tropas: ${Juego.Juego.jugador.ejercito.length}</p>
                <p>Intentos de Contratar: ${Juego.Juego.jugador.intentosContratar}</p>
                <p>Recuperación Disponible: ${Juego.Juego.jugador.recuperacionDisponible ? "Sí" : "No"}</p>

            `;

    informacionContent.innerHTML += Utils.boton("btn-guardar", "Guardar Partida");
    informacionContent.innerHTML += Utils.boton("btn-salir", "Salir");
  }
}

// Abre el panel de informacion
export function informacion() {
  const panelInformacion = document.getElementById("panel-informacion");
  
  actualizarInformacion();

  // JQueryUI para poder arrastrarlo
  if (!$(panelInformacion).hasClass("ui-draggable")) {
    setTimeout(() => {
      $(panelInformacion).draggable({
        containment: "body",
        scroll: false,
      });
    }, 50);
  }

  abrirPanel("panel-informacion");
}











//////////////
// FUNCIONES COMBATIR
//////////////

// Funcion "core" para combatir
export function combatir() {
  // Cambio la vista, fondo, cierro paneles, etc
  cerrarTodosPaneles();
  document.getElementById("navbar").classList.add("hidden");
  document.getElementById("background").style.backgroundImage = "url('./assets/images/bgFight.png')";
  Juego.generarEnemigo(); 
  document.getElementById("battle-combat").classList.remove("hidden");
  document.getElementById("battle-screen").classList.remove("hidden");
  
  // Vacio los logs y muestro el inicial
  Utils.limpiarLogBatalla();
  const tropasVivas = Juego.Juego.jugador.ejercito.filter(t => t.salud > 0).length;
  Utils.añadirLogBatalla('¡La batalla ha comenzado!', 'inicio');
  Utils.añadirLogBatalla(`Tu ejército: ${tropasVivas} tropas vivas de ${Juego.Juego.jugador.ejercito.length}`, 'normal');
  Utils.añadirLogBatalla(`Ejército enemigo: ${Juego.Juego.enemigos.length} tropas`, 'normal');
  
  // Genero las dos tarjetas de la tropa mia y del enemigo
  const batallaTarjetas = document.getElementById("batalla-tarjetas");
  const jugadorVivo = Juego.Juego.jugador.ejercito.find(t => t.salud > 0);
  const enemigoVivo = Juego.Juego.enemigos.find(e => e.salud > 0);
  // Agrego las tarjetas generadas al HTML
  if (jugadorVivo) batallaTarjetas.innerHTML += Utils.tropaCombate(jugadorVivo, 0);
  if (enemigoVivo) batallaTarjetas.innerHTML += Utils.tropaCombate(enemigoVivo, 1);
  
  // Genero las dos tarjetas para las proximas tropas que combatiran
  const proximoJugador = Juego.Juego.jugador.ejercito.find(t => t.salud > 0 && t !== jugadorVivo);
  const proximoEnemigo = Juego.Juego.enemigos.find(e => e.salud > 0 && e !== enemigoVivo);
  // Agrego las tarjetas generadas al HTML
  if (proximoJugador) {
    document.getElementById("tropa-proxima-jugador").innerHTML = Utils.siguienteTropa(proximoJugador, 0);
  }
  if (proximoEnemigo) {
    document.getElementById("tropa-proxima-enemigo").innerHTML = Utils.siguienteTropa(proximoEnemigo, 1);
  }
  // Creo un boton dinamico para ir al siguiente "paso" del combate
  document.getElementById("boton-combatir-siguiente").innerHTML = Utils.botonPequeno("btn-atacar", "Atacar", "btn-atacar");

  // Agrego las imagenes de las tropas al combate
  if (jugadorVivo) {
    const nombreNormalizado = Utils.normalizarNombre(jugadorVivo.nombre);
    document.getElementById("batalla-imagenes-jugador").innerHTML += `<img draggable=false src="./assets/images/troops/${nombreNormalizado}Fgh.png" alt="${jugadorVivo.nombre}" class="w-96 h-96 object-contain">`;
  }
  if (enemigoVivo) {
    const nombreNormalizado = Utils.normalizarNombre(enemigoVivo.nombre);
    document.getElementById("batalla-imagenes-enemigo").innerHTML += `<img draggable=false src="./assets/images/troops/${nombreNormalizado}Fgh.png" alt="${enemigoVivo.nombre}" class="w-96 h-96 object-contain scale-x-[-1]">`;
  }
  

  // Log inicial
  if (jugadorVivo && enemigoVivo) {
    Utils.añadirLogBatalla(`${jugadorVivo.nombre} se enfrenta a ${enemigoVivo.nombre}`, 'inicio');
  }
  Juego.Juego.turno = 0; // Turno del jugador
}





// Calcula si el atacante tiene ventaja
function tieneVentajaTipo(atacante, defensor) {
  // Mago > Guerrero > Ladrón > Mago
  const ventajas = {
    "Mago": "Guerrero",
    "Guerrero": "Ladrón",
    "Ladrón": "Mago"
  };
  
  return ventajas[atacante.nombre] === defensor.nombre;
}




// Calcula el daño en funcion de la fuerza con la ventaja
function calcularDaño(atacante, defensor) {
  let daño = atacante.fuerza;
  
  if (tieneVentajaTipo(atacante, defensor)) {
    daño = Math.floor(daño * 1.5);
    Utils.añadirLogBatalla(`¡Ventaja de tipo! ${atacante.nombre} es fuerte contra ${defensor.nombre}`, 'normal');
  }
  
  return daño;
}




// Calcula si el ladron puede esquivar el ataque
function puedeEsquivar(personaje, atacante) {
  if (personaje.nombre === "Ladrón" && personaje.habilidadEspecial && personaje.habilidadEspecial.usos > 0) {
    const esquiva = Math.random() < personaje.habilidadEspecial.probEsquivar;
    if (esquiva) {
      Utils.añadirLogBatalla(`¡${personaje.nombre} esquiva el ataque de ${atacante.nombre}!`, 'normal');
      personaje.habilidadEspecial.usos--;
      Utils.añadirLogBatalla(`Usos restantes de ${personaje.habilidadEspecial.nombre}: ${personaje.habilidadEspecial.usos}`, 'normal');
      return true;
    }
  }
  return false;
}




// Recarga las habilidades especiales
function recargarHabilidades(ejercito) {
  ejercito.forEach(tropa => {
    if (tropa.habilidadEspecial && tropa.habilidadEspecial.usosMax) {
      tropa.habilidadEspecial.usos = tropa.habilidadEspecial.usosMax;
    }
  });
}




// Aplica la habilidad especial dependiendo del tipo de tropa y la lógica de cada una
function aplicarHabilidadEspecial(usuario, objetivo) {
  if (!usuario.habilidadEspecial || usuario.habilidadEspecial.usos <= 0) {
    return 0;
  }

  let dañoAdicional = 0;
  const habilidad = usuario.habilidadEspecial;

  if (usuario.nombre === "Guerrero") {
    // Ataques concentrados
    dañoAdicional = habilidad.danio;
    objetivo.salud -= dañoAdicional;
    Utils.añadirLogBatalla(`¡${usuario.nombre} usa ${habilidad.nombre}! Causa ${dañoAdicional} de daño adicional.`, 'daño');
  } else if (usuario.nombre === "Mago") {
    // Bola de fuego
    dañoAdicional = habilidad.danio;
    objetivo.salud -= dañoAdicional;
    Utils.añadirLogBatalla(`¡${usuario.nombre} lanza ${habilidad.nombre}! Causa ${dañoAdicional} de daño devastador.`, 'daño');
  }

  habilidad.usos--;
  Utils.añadirLogBatalla(`Usos restantes de ${habilidad.nombre}: ${habilidad.usos}`, 'normal');
  
  return dañoAdicional;
}




// Finaliza el combate y muestra le resultado
export function siguienteCombate() {
  const jugador = Juego.Juego.jugador.ejercito.find(t => t.salud > 0);
  const enemigo = Juego.Juego.enemigos.find(e => e.salud > 0);

  if (!jugador || !enemigo) {
    finalizarCombate();
    return;
  }

  // Verifica el turno
  if (Juego.Juego.turno === 0) {
    // Turno jugador, comprueba la habilidad especial
    let dañoEspecial = 0;
    if (jugador.habilidadEspecial && jugador.habilidadEspecial.usos > 0 && jugador.nombre !== "Ladrón") {
      dañoEspecial = aplicarHabilidadEspecial(jugador, enemigo);
    }

    const dañoJugador = calcularDaño(jugador, enemigo);
    
    // Verificar si el enemigo puede esquivar
    if (!puedeEsquivar(enemigo, jugador)) {
      enemigo.salud -= dañoJugador;
      Utils.añadirLogBatalla(`${jugador.nombre} ataca a ${enemigo.nombre} causando ${dañoJugador} de daño.`, 'daño');
    }
    
    // Calcula el daño base del enemigo
    actualizarTarjetaCombate(enemigo, 1);

    if (enemigo.salud <= 0) {
      Utils.añadirLogBatalla(`${enemigo.nombre} ha sido derrotado!`, 'muerte');
      Juego.Juego.turno = 0; // Resetear turno
      
      if (Juego.Juego.enemigos.some(e => e.salud > 0)) {
        actualizarCombate();
      } else {
        victoria();
      }
      return;
    }

    // Turno enemigo
    Juego.Juego.turno = 1;
    Utils.añadirLogBatalla(`Turno del enemigo`, 'normal');
    
  } else {
    // Turno del enemigo, verifica habilidad especial
    let dañoEspecial = 0;
    if (enemigo.habilidadEspecial && enemigo.habilidadEspecial.usos > 0 && enemigo.nombre !== "Ladrón") {
      dañoEspecial = aplicarHabilidadEspecial(enemigo, jugador);
    }

    // Calcula el daño base del enemigo
    const dañoEnemigo = calcularDaño(enemigo, jugador);
    
    // Verifica si el jugador puede esquivar
    if (!puedeEsquivar(jugador, enemigo)) {
      jugador.salud -= dañoEnemigo;
      Utils.añadirLogBatalla(`${enemigo.nombre} ataca a ${jugador.nombre} causando ${dañoEnemigo} de daño.`, 'daño');
    }
    
    actualizarTarjetaCombate(jugador, 0);

    if (jugador.salud <= 0) {
      Utils.añadirLogBatalla(`${jugador.nombre} ha sido derrotado!`, 'muerte');
      Juego.Juego.turno = 0; // Resetear turno
      
      if (Juego.Juego.jugador.ejercito.some(t => t.salud > 0)) {
        actualizarCombate();
      } else {
        derrota();
      }
      return;
    }

    // Cambiar al turno del jugador
    Juego.Juego.turno = 0;
    Utils.añadirLogBatalla(`Turno del jugador`, 'normal');
  }
}




// Actualiza las tarjetas de las tropas
function actualizarTarjetaCombate(tropa, lado) {
  const batallaTarjetas = document.getElementById("batalla-tarjetas");
  const tarjetas = batallaTarjetas.querySelectorAll('.tropa-combate');
  if (tarjetas[lado]) {
    tarjetas[lado].outerHTML = Utils.tropaCombate(tropa, lado);
  }
}





// Actualiza todo el combate para mostrar la siguiente tropa o el resultado final
function actualizarCombate() {
  const batallaTarjetas = document.getElementById("batalla-tarjetas");
  batallaTarjetas.innerHTML = '';
  
  // Obtener próximas tropas con vida > 0
  const jugadorVivo = Juego.Juego.jugador.ejercito.find(t => t.salud > 0);
  const enemigoVivo = Juego.Juego.enemigos.find(e => e.salud > 0);
  // Añado las tarjetas generadas al HTML
  if (jugadorVivo) batallaTarjetas.innerHTML += Utils.tropaCombate(jugadorVivo, 0);
  if (enemigoVivo) batallaTarjetas.innerHTML += Utils.tropaCombate(enemigoVivo, 1);

  // Actualizar imagenes
  if (jugadorVivo) {
    const nombreNormalizado = Utils.normalizarNombre(jugadorVivo.nombre);
    document.getElementById("batalla-imagenes-jugador").innerHTML = `<img draggable=false src="./assets/images/troops/${nombreNormalizado}Fgh.png" alt="${jugadorVivo.nombre}" class="w-96 h-96 object-contain">`;
  }
  if (enemigoVivo) {
    const nombreNormalizado = Utils.normalizarNombre(enemigoVivo.nombre);
    document.getElementById("batalla-imagenes-enemigo").innerHTML = `<img draggable=false src="./assets/images/troops/${nombreNormalizado}Fgh.png" alt="${enemigoVivo.nombre}" class="w-96 h-96 object-contain scale-x-[-1]">`;
  }

  // Actualizar próximas tropas
  const proximoJugador = Juego.Juego.jugador.ejercito.find(t => t.salud > 0 && t !== jugadorVivo);
  const proximoEnemigo = Juego.Juego.enemigos.find(e => e.salud > 0 && e !== enemigoVivo);
  
  if (proximoJugador) {
    document.getElementById("tropa-proxima-jugador").innerHTML = Utils.siguienteTropa(proximoJugador, 0);
  } else {
    document.getElementById("tropa-proxima-jugador").innerHTML = '';
  }

  if (proximoEnemigo) {
    document.getElementById("tropa-proxima-enemigo").innerHTML = Utils.siguienteTropa(proximoEnemigo, 1);
  } else {
    document.getElementById("tropa-proxima-enemigo").innerHTML = '';
  }

  if (jugadorVivo && enemigoVivo) {
    Utils.añadirLogBatalla(`Siguiente combate: ${jugadorVivo.nombre} vs ${enemigoVivo.nombre}`, 'inicio');
  }
  Juego.Juego.turno = 0; // Resetear turno al jugador
}






// Funcion de victoria
function victoria() {
  Utils.añadirLogBatalla('Has ganado', 'victoria');
  const recompensa = 500 * Juego.Juego.enemigos.length;
  Juego.Juego.jugador.victorias++;
  Juego.Juego.jugador.oro += recompensa;
  Juego.Juego.jugador.intentosContratar = 3;
  Utils.notificacion("Recompensa", `Has ganado ${recompensa} de oro por el combate.`);
  
  // Esconder botón de atacar para evitar múltiples clics
  document.getElementById("boton-combatir-siguiente").innerHTML = "";

  // Comrpobar victorias necesarias
  const victoriasNecesarias = Juego.Juego.dificultad === 'facil' ? 2 : 4;
  
  setTimeout(() => {
    document.getElementById("battle-combat").classList.add("hidden");
    
    if (Juego.Juego.jugador.victorias >= victoriasNecesarias) {
      // Gana la partida
      document.getElementById("battle-victory").classList.remove("hidden");
      document.getElementById("victory-content").innerHTML = `
        <h2 class="text-3xl font-bold mb-4">Has ganado!</h2>
        <p>Has conseguido ${victoriasNecesarias} victorias</p>
        <p>Oro final: ${Juego.Juego.jugador.oro}</p>
        <p>Dificultad: ${Juego.Juego.dificultad}</p>
        <button data-action="btn-menu-principal" class="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded">Menú Principal</button>
      `;
    } else {
      // Continua la partida y vuelve al menu
      document.getElementById("battle-victory").classList.remove("hidden");
      document.getElementById("victory-content").innerHTML = `
        <p>Has ganado ${recompensa} de oro</p>
        <p>Total de oro: ${Juego.Juego.jugador.oro}</p>
        <p>Victorias: ${Juego.Juego.jugador.victorias} / ${victoriasNecesarias}</p>
        <button data-action="btn-volver-base" class="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded">Volver a la base</button>
      `;
    }
  }, 1500);
}







// Funcion de derrota
function derrota() {
  Utils.añadirLogBatalla('Has perdido', 'muerte');
  Juego.Juego.jugador.derrotas++;
  Juego.Juego.jugador.intentosContratar = 3;
  
  // Esconder botón de atacar para evitar múltiples clics
  document.getElementById("boton-combatir-siguiente").innerHTML = "";

  setTimeout(() => {
    document.getElementById("battle-combat").classList.add("hidden");
    
    if (Juego.Juego.jugador.derrotas >= 2) {
      // Ha perdido al partida
      document.getElementById("battle-defeat").classList.remove("hidden");
      document.getElementById("defeat-content").innerHTML = `
        <h2 class="text-3xl font-bold mb-4">Has perdido!</h2>
        <p>Has acumulado 2 derrotas</p>
        <p>Oro restante: ${Juego.Juego.jugador.oro}</p>
        <p>Victorias conseguidas: ${Juego.Juego.jugador.victorias}</p>
        <button data-action="btn-menu-principal" class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded">Menú Principal</button>
      `;
    } else {
      // Continua la partida y vuelve al menu
      document.getElementById("battle-defeat").classList.remove("hidden");
      document.getElementById("defeat-content").innerHTML = `
        <p>Has perdido tu ejército</p>
        <p>Oro restante: ${Juego.Juego.jugador.oro}</p>
        <p>Derrotas: ${Juego.Juego.jugador.derrotas} / 2</p>
        <button data-action="btn-volver-base" class="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded">Volver a la base</button>
      `;
    }
  }, 1500);
}





// Finaliza el combate comprobando si hay tropas restantes
function finalizarCombate() {
  const hayEnemigosVivos = Juego.Juego.enemigos.some(e => e.salud > 0);
  const hayJugadorVivo = Juego.Juego.jugador.ejercito.some(t => t.salud > 0);
  
  if (hayEnemigosVivos && !hayJugadorVivo) {
    derrota();
  } else if (!hayEnemigosVivos && hayJugadorVivo) {
    victoria();
  }
}




// Funcion para recuperar tropas despues del combate
export function recuperarTropa(id) {
  const tropa = Juego.Juego.jugador.ejercito[id];
  if (tropa && tropa.salud <= 0) {
    tropa.salud = Math.floor(tropa.saludMax * 0.7);
    
    // Restablecer habilidades especiales
    if (tropa.habilidadEspecial && tropa.habilidadEspecial.usosMax) {
      tropa.habilidadEspecial.usos = tropa.habilidadEspecial.usosMax;
    }
    
    Utils.notificacion("Recuperación", `${tropa.nombre} ha sido recuperado al 70% de su vida y sus habilidades han sido restablecidas.`);
  }
}

// Función para recuperar todas las tropas dañadas
export function recuperarTodasLasTropas() {
  let contadorRecuperadas = 0;
  Juego.Juego.jugador.ejercito.forEach((tropa, index) => {
    if (tropa.salud <= 0) {
      recuperarTropa(index);
      contadorRecuperadas++;
    }
  });
  
  if (contadorRecuperadas > 0) {
    Utils.notificacion("Recuperación Masiva", `Se han recuperado ${contadorRecuperadas} tropas al 70% de su vida.`);
  }
}

// Función para salir sin guardar y volver al menú principal
export function salirSinGuardar() {
  // Cerrar todos los paneles
  cerrarTodosPaneles();
  
  // Limpiar interfaz
  document.getElementById("navbar-ui").innerHTML = "";
  document.getElementById("home-ui").innerHTML = "";
  document.getElementById("navbar").classList.add("hidden");
  document.getElementById("base-screen").classList.add("hidden");
  document.getElementById("battle-screen").classList.add("hidden");
  
  // Mostrar pantalla de inicio
  document.getElementById("home-screen").classList.remove("hidden");
  document.getElementById("background").style.backgroundImage = "url('./assets/images/bg.png')";
  
  // Regenerar menú
  Juego.estado = 'menu';
}