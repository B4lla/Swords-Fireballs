// Modulos necesarios
import * as Juego from "./juego.js";
import * as Utils from "./utils.js";
import { crearMenu } from "./menuBuilder.js";

// Variable para controlar el z-index de los paneles
let panelZindex = 100;
const CANTIDAD_ITEMS_TIENDA = 3; // Cambia este número para renderizar X items en la tienda.



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
  const items = [];

  const tropasParaRecuperar = Juego.Juego.jugador.ejercito.some(tropa => tropa.salud <= 0);
  if (tropasParaRecuperar) {
    items.push({
      tipo: "accion",
      accion: "recuperar-todas",
      texto: "Recuperar tropas"
    });
  }

  Juego.Juego.jugador.ejercito.forEach((tropa, index) => {
    items.push({
      tipo: "tropa",
      tropa,
      index
    });
  });

  crearMenu({
    menuId: "ver-ejercito",
    contenedorId: "panel-verEjercito-content",
    items,
    renderContenidoItem: item => {
      if (item.tipo === "accion") {
        return Utils.boton("btn-recuperar-todas", item.texto);
      }

      return Utils.contenidoTropaEjercito(item.tropa, item.index);
    },
    onItemClick: ({ item }) => {
      if (item.accion === "recuperar-todas") {
        recuperarTodasLasTropas();
        actualizarContenidoVerEjercito();
      }
    }
  });
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
// FUNCIONES RECLUTAR
//////////////

// Genera las tarjetas de la tienda usando el creador genérico de menús.
// Aquí puedes pasar X items y cualquier HTML para cada item.
async function generarTropasReclutar(cantidad = CANTIDAD_ITEMS_TIENDA) {
  const tropas = Juego.generarTienda(cantidad);

  if (!tropas || tropas.length === 0) return;

  Juego.Juego.jugador.intentosContratar--;

  try {
    await crearMenu({
      menuId: "tienda-reclutar",
      contenedorId: "tropas-reclutar",
      items: tropas,
      asincrono: true,
      minDelay: 2000,
      maxDelay: 5000,
      renderContenidoItem: (tropa, index) => {
        const ejercitoLleno = Juego.Juego.jugador.ejercito.length >= 5;
        return Utils.contenidoTropaReclutable(tropa, index, Juego.Juego.jugador.oro, ejercitoLleno);
      },
      onItemClick: ({ item: tropa, index, event }) => {
        const botonComprar = event.target.closest('[data-item-action="comprar"]');
        if (!botonComprar) return;

        comprarTropaTienda(index);
      }
    });
  } catch (error) {
    console.error(`Error al cargar las tropas:`, error);
    Utils.notificacion("Error", `Hubo un problema cargando las tropas.`);
  }
}

export function comprarTropaTienda(index) {
  const tropa = Juego.Juego.tropasTienda[index];

  if (!tropa) return;

  if (Juego.Juego.jugador.ejercito.length >= 5) {
    Utils.notificacion("Compra", `No puedes reclutar a ${tropa.nombre} porque tu ejercito ya tiene 5 tropas.`);
    return;
  }

  if (Juego.Juego.jugador.oro < tropa.costo) {
    Utils.notificacion("Compra", `No tienes suficiente oro para reclutar a ${tropa.nombre}.`);
    return;
  }

  Utils.notificacion("Compra", `Has reclutado a ${tropa.nombre}.`);
  Juego.reclutarTropa(tropa);
  Juego.Juego.jugador.oro -= tropa.costo;

  actualizarInformacion();
  generarTropasReclutar();

  const panelVerEjercito = document.getElementById("panel-verEjercito");
  if (panelVerEjercito && $(panelVerEjercito).is(":visible")) {
    actualizarContenidoVerEjercito();
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

  if (Juego.Juego.jugador.ejercito.length === 0) {
    Utils.notificacion("Error", "No tienes tropas para despedir.");
    return;
  }

  if ($(panelDespedir).is(":visible")) {
    abrirPanel("panel-despedir");
    return;
  }

  crearMenu({
    menuId: "despedir",
    contenedorId: "panel-despedir-content",
    items: Juego.Juego.jugador.ejercito,
    renderContenidoItem: (tropa, index) => Utils.contenidoTropaDespedir(tropa, index),
    onItemClick: ({ index, event }) => {
      const botonDespedir = event.target.closest('[data-item-action="despedir"]');
      if (!botonDespedir) return;
      despedirTropaPorIndex(index);
    }
  });

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

function despedirTropaPorIndex(index) {
  const tropaADespedir = Juego.Juego.jugador.ejercito[index];
  if (!tropaADespedir) return;

  const oroRecibido = tropaADespedir.reembolso;
  Utils.notificacion("Despido", `Has despedido a ${tropaADespedir.nombre} y recibido ${oroRecibido} de oro.`);
  Juego.Juego.jugador.oro += oroRecibido;
  Juego.Juego.jugador.ejercito.splice(index, 1);
  actualizarInformacion();

  if (Juego.Juego.jugador.ejercito.length === 0) {
    abrirPanel("panel-despedir");
    return;
  }

  crearMenu({
    menuId: "despedir",
    contenedorId: "panel-despedir-content",
    items: Juego.Juego.jugador.ejercito,
    renderContenidoItem: (tropa, index) => Utils.contenidoTropaDespedir(tropa, index),
    onItemClick: ({ index, event }) => {
      const boton = event.target.closest('[data-item-action="despedir"]');
      if (!boton) return;
      despedirTropaPorIndex(index);
    }
  });
}







//////////////
// FUNCIONES INFORMACION
//////////////

// Actualiza la informacion cada vez que se solicita
export function actualizarInformacion() {
  const items = [
    { tipo: "texto", html: `<p>Oro: ${Juego.Juego.jugador.oro}</p>` },
    { tipo: "texto", html: `<p>Victorias: ${Juego.Juego.jugador.victorias}</p>` },
    { tipo: "texto", html: `<p>Derrotas: ${Juego.Juego.jugador.derrotas}</p>` },
    { tipo: "texto", html: `<p>Tropas: ${Juego.Juego.jugador.ejercito.length}</p>` },
    { tipo: "texto", html: `<p>Intentos de Contratar: ${Juego.Juego.jugador.intentosContratar}</p>` },
    { tipo: "texto", html: `<p>Recuperación Disponible: ${Juego.Juego.jugador.recuperacionDisponible ? "Sí" : "No"}</p>` },
    { tipo: "boton", html: Utils.boton("btn-guardar", "Guardar Partida") },
    { tipo: "boton", html: Utils.boton("btn-salir", "Salir") }
  ];

  crearMenu({
    menuId: "informacion",
    contenedorId: "panel-informacion-content",
    items,
    renderContenidoItem: item => item.html
  });
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
  batallaTarjetas.innerHTML = "";
  document.getElementById("batalla-imagenes-jugador").innerHTML = "";
  document.getElementById("batalla-imagenes-enemigo").innerHTML = "";
  document.getElementById("tropa-proxima-jugador").innerHTML = "";
  document.getElementById("tropa-proxima-enemigo").innerHTML = "";
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
    if (tropa.curarPorcentaje) {
      tropa.curarPorcentaje(0.7);
    } else {
      tropa.salud = Math.floor(tropa.saludMax * 0.7);
    }
    
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
  document.getElementById("navbar-ui").replaceChildren();
  document.getElementById("home-ui").replaceChildren();
  document.getElementById("navbar").classList.add("hidden");
  document.getElementById("base-screen").classList.add("hidden");
  document.getElementById("battle-screen").classList.add("hidden");
  
  // Mostrar pantalla de inicio
  document.getElementById("home-screen").classList.remove("hidden");
  document.getElementById("background").style.backgroundImage = "url('./assets/images/bg.png')";
  
  // Regenerar menú
  Juego.Juego.estado = 'menu';
}