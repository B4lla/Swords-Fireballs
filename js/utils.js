// Normalizar nombre para la rutas de las imagenes
// Quita tildes, mayusculas, etc.
export function normalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Obitene las cookies para cargar la partida guardada
export function getCookies(nombre) {
  if (!document.cookie) return null;
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    if (idx === -1) continue;
    const key = cookie.substring(0, idx);
    const value = cookie.substring(idx + 1);
    if (key === nombre) return decodeURIComponent(value || '');
  }
  return null;
}

// Guarda las cookies para guardar la partida
export function guardarCookies(nombre, valor, dias) {
  const fechaExpiracion = new Date();
  fechaExpiracion.setTime(fechaExpiracion.getTime() + (dias * 24 * 60 * 60 * 1000));
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${fechaExpiracion.toUTCString()}; path=/`;
}

// Generador de boton dinamico para todo el juego
export function boton(id, text) {
  return `
    <button id="${id}" data-action="${id}" type="button" class="relative z-10 group outline-none cursor-pointer transition-transform active:scale-95 filter drop-shadow-[0_4px_3px_rgba(0,0,0,0.5)] w-full max-w-[22rem] min-w-[200px]">
        <div class="scooped-corner bg-[#1a1410] p-[2px] w-full h-[clamp(56px,10vw,76px)]">
            <div class="scooped-corner bg-[#D2B48C] w-full h-full p-[clamp(2px,0.8vw,4px)]">
                <div class="scooped-corner bg-[#756452] w-full h-full p-[clamp(1px,0.5vw,2px)]">
                    <div class="scooped-corner w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#E4CCA2_20%,_#D2B48C_100%)] py-[clamp(6px,1.8vw,12px)]">
                        <span class="text-[#3e3226] font-['Cinzel'] text-[clamp(0.95rem,2.6vw,1.6rem)] font-medium tracking-wide uppercase pt-[clamp(1px,0.4vw,3px)] select-none">
                            ${text}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </button>
  `;
}

// Genera otro boton con un diseño parecido
export function botonPequeno(id, text, selected = false) {
  const shadowEffect = selected
    ? "drop-shadow-[0_0_12px_rgba(218,165,32,0.9)] drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
    : "drop-shadow-[0_4px_3px_rgba(0,0,0,0.5)]";
  
  return `
    <button id="${id}" data-action="${id}" data-difficulty="${id.replace('btn-', '')}" type="button" class="relative z-10 group outline-none cursor-pointer transition-all duration-300 active:scale-95 filter ${shadowEffect} w-full max-w-[10.5rem] min-w-[140px]">
        <div class="scooped-corner bg-[#1a1410] p-[2px] w-full h-[clamp(56px,10vw,76px)]">
            <div class="scooped-corner bg-[#D2B48C] w-full h-full p-[clamp(2px,0.8vw,4px)]">
                <div class="scooped-corner bg-[#756452] w-full h-full p-[clamp(1px,0.5vw,2px)]">
                    <div class="scooped-corner w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#E4CCA2_20%,_#D2B48C_100%)] py-[clamp(6px,1.8vw,12px)]">
                        <span class="text-[#3e3226] font-['Cinzel'] text-[clamp(0.95rem,2.6vw,1.6rem)] font-medium tracking-wide uppercase pt-[clamp(1px,0.4vw,3px)] select-none">
                            ${text}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </button>
  `;
}

// Modal de notificaciones
export function notificacion(titulo, mensaje) {
  const notificacionHTML = `
    <div class="notificacion-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>
    <div class="notificacion-popup hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div class="scooped-corner bg-[#0a0805]/20 p-[6px] w-full">
            <div class="scooped-corner bg-[#D2B48C] w-full p-[clamp(2px,0.8vw,4px)]">
                <div class="scooped-corner w-full bg-[radial-gradient(ellipse_at_center,_#E4CCA2_10%,_#D2B48C_100%)] p-[clamp(16px,2.4vw,20px)]">
                    <div class="text-center">
                        <h3 class="text-[#3e3226] font-['Cinzel'] text-[clamp(0.95rem,2.4vw,1.3rem)] font-bold mb-4 uppercase tracking-wide">
                            ${titulo}
                        </h3>
                        <p class="text-[#4a3f38] font-['Cinzel'] text-[clamp(0.8rem,1.8vw,1rem)] leading-relaxed mb-6">
                            ${mensaje}
                        </p>
                        <button class="notif-aceptar relative outline-none cursor-pointer transition-transform active:scale-95 drop-shadow-[0_4px_3px_rgba(0,0,0,0.5)] w-[clamp(120px,25vw,160px)]">
                            <div class="scooped-corner bg-[#1a1410] p-[2px] w-full h-[clamp(40px,8vw,52px)]">
                                <div class="scooped-corner bg-[#D2B48C] w-full h-full p-[clamp(2px,0.8vw,4px)]">
                                    <div class="scooped-corner w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#E4CCA2_20%,_#D2B48C_100%)]">
                                        <span class="text-[#3e3226] font-['Cinzel'] text-[clamp(0.8rem,2vw,1rem)] font-medium uppercase select-none">
                                            Aceptar
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
  
  // Agrega la notificacion por encima de todo
  $('body').append(notificacionHTML);
  $('.notificacion-popup').fadeIn(300);
  
  // Al aceptar hace fadeOut
  $('.notif-aceptar').on('click', function() {
    $('.notificacion-popup').fadeOut(300, function() { $(this).remove(); });
    $('.notificacion-overlay').fadeOut(300, function() { $(this).remove(); });
  });
}

// TROPA TIENDA
export function tropaReclutable(tropa, id, oroJugador, ejercitoLleno = false) {
  const puedeComprar = oroJugador >= tropa.costo && !ejercitoLleno;
  let estiloBoton, mensajeBoton;
  
  // Mensajes y estilos en funcion de si puede comprar o no
  if (ejercitoLleno) {
    estiloBoton = "text-sm font-semibold text-gray-400 bg-gradient-to-t from-gray-500 to-gray-600 px-3 py-2 border-3 border-gray-500 opacity-50 cursor-not-allowed";
    mensajeBoton = "Ejército lleno";
  } else if (oroJugador < tropa.costo) {
    estiloBoton = "text-sm font-semibold text-gray-400 bg-gradient-to-t from-gray-500 to-gray-600 px-3 py-2 border-3 border-gray-500 opacity-50 cursor-not-allowed";
    mensajeBoton = `<i class="fas fa-coins mr-1"></i>${tropa.costo}`;
  } else {
    estiloBoton = "text-sm font-semibold text-[#F5E6BE] bg-gradient-to-t from-[#CB9039] to-[#875822] px-3 py-2 border-3 border-[#D99F42]";
    mensajeBoton = `<i class="fas fa-coins mr-1"></i>${tropa.costo}`;
  }
  
  return `
    <div id="tropa-compra-${id}" class="bg-[#D2B48C] border-4 border-[#775732] rounded-lg p-3 w-[min(95vw,28rem)] text-[#2C2318]" data-tropa="${tropa.nombre}">
      <div class="flex items-start gap-3">
        <img src="./assets/images/troops/${normalizarNombre(tropa.nombre)}.png" alt="${tropa.nombre}" class="w-16 h-16 rounded-full">
        <div class="flex flex-col flex-1 min-w-0">
          <h3 class="text-base font-bold">${tropa.nombre}</h3>
          <div class="flex flex-col gap-2 mt-2">
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">HP</span>
                <span class="font-semibold">${tropa.salud}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-red-500 h-2" style="width: ${tropa.salud}%"></div>
              </div>
            </div>
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">ATK</span>
                <span class="font-semibold">${tropa.fuerza}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-green-500 h-2" style="width: ${tropa.fuerza}%"></div>
              </div>
            </div>
          </div>
        </div>
        <button id="btn-tropa-compra-${id}" class="ml-auto text-right items-center gap-2 mt-8" ${!puedeComprar ? 'disabled' : ''}>
          <div class="${estiloBoton}">
            ${mensajeBoton}
          </div>
        </button>
      </div>
    </div>
  `;
}


// TROPA EJERCITO
export function tropaEjercito(tropa, id) {
  const estadoClass = tropa.salud <= 0 ? 'opacity-50 grayscale' : '';
  const etiquetaEstado = tropa.salud <= 0 ? '<span class="text-red-600 font-bold text-xs">MUERTO</span>' : '';
  
  return `
    <div id="tropa-jugador-${id}" class="bg-[#D2B48C] border-4 border-[#775732] rounded-lg p-3 w-[min(95vw,28rem)] text-[#2C2318] ${estadoClass} pointer-events-none select-none" data-tropa="${tropa.nombre}">
      <div class="flex items-start gap-3">
        <img src="./assets/images/troops/${normalizarNombre(tropa.nombre)}.png" alt="${tropa.nombre}" class="w-16 h-16 rounded-full">
        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold">${tropa.nombre}</h3>
            ${etiquetaEstado}
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">HP</span>
                <span class="font-semibold">${tropa.salud} / ${tropa.saludMax}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-red-500 h-2" style="width: ${(tropa.salud / tropa.saludMax * 100)}%"></div>
              </div>
            </div>
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">ATK</span>
                <span class="font-semibold">${tropa.fuerza}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-green-500 h-2" style="width: ${(tropa.fuerza / 100 * 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `; 
}

// TROPA DESPEDIR
export function tropaDespedir(tropa, id) {
  return `
    <div id="tropa-despedir-${id}" class="bg-[#D2B48C] border-4 border-[#775732] rounded-lg p-3 w-[min(95vw,28rem)] text-[#2C2318]" data-tropa="${tropa.nombre}">
      <div class="flex items-start gap-3">
        <img src="./assets/images/troops/${normalizarNombre(tropa.nombre)}.png" alt="${tropa.nombre}" class="w-16 h-16 rounded-full">
        <div class="flex flex-col flex-1 min-w-0">
          <h3 class="text-base font-bold">${tropa.nombre}</h3>
          <div class="flex flex-col gap-2 mt-2">
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">HP</span>
                <span class="font-semibold">${tropa.salud}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-red-500 h-2" style="width: ${tropa.salud}%"></div>
              </div>
            </div>
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">ATK</span>
                <span class="font-semibold">${tropa.fuerza}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-green-500 h-2" style="width: ${tropa.fuerza}%"></div>
              </div>
            </div>
          </div>
        </div>
        <button id="btn-tropa-despedir-${id}" class="ml-auto text-right items-center gap-2 mt-8">
          <div class="text-sm font-semibold text-[#F5E6BE] bg-gradient-to-t from-[#CB9039] to-[#875822] px-3 py-2 border-3 border-[#D99F42]">
            <i class="fas fa-minus mr-1"></i>
          </div>
        </button>
      </div>
    </div>
  `;
}

// Añade un log con el diseño dependiendo del tipo de mensaje y la hora
export function añadirLogBatalla(mensaje, tipo = 'normal') {
  const batallaLog = document.getElementById('batalla-log');
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  let colorClase = '';
  switch(tipo) {
    case 'daño':
      colorClase = 'text-red-400';
      break;
    case 'habilidad':
      colorClase = 'text-blue-400';
      break;
    case 'muerte':
      colorClase = 'text-red-600 font-bold';
      break;
    case 'victoria':
      colorClase = 'text-green-500 font-bold';
      break;
    case 'inicio':
      colorClase = 'text-yellow-400 font-bold';
      break;
    default:
      colorClase = 'text-yellow-100';
  }
  
  // Reemplazar nombres especiales con versión resaltada
  let mensajeResaltado = mensaje;
  
  // Resaltar habilidades especiales
  mensajeResaltado = mensajeResaltado.replace(/Bola de Fuego/g, '<span class="text-orange-400 font-bold">Bola de Fuego</span>');
  mensajeResaltado = mensajeResaltado.replace(/Ataques Concentrados/g, '<span class="text-amber-300 font-bold">Ataques Concentrados</span>');
  mensajeResaltado = mensajeResaltado.replace(/Esquiva/g, '<span class="text-cyan-400 font-bold">Esquiva</span>');
  
  // Resaltar ventajas de tipo
  mensajeResaltado = mensajeResaltado.replace(/¡Ventaja de tipo!/g, '<span class="text-lime-400 font-bold">¡Ventaja de tipo!</span>');
  
  const logEntry = document.createElement('div');
  logEntry.className = `mb-1 ${colorClase}`;
  logEntry.innerHTML = `<span class="text-gray-400">[${timestamp}]</span> ${mensajeResaltado}`;
  
  batallaLog.appendChild(logEntry);
  batallaLog.scrollTop = batallaLog.scrollHeight;
}

// Limpia el log
export function limpiarLogBatalla() {
  const batallaLog = document.getElementById('batalla-log');
  batallaLog.innerHTML = '';
}

// Carta de tropas en la batalla
export function tropaCombate(tropa, id) {
  return `
    <div id="tropa-jugador-${id}" class="tropa-combate bg-[#D2B48C] border-4 border-[#775732] rounded-lg p-3 w-[min(95vw,28rem)] text-[#2C2318]" data-tropa="${tropa.nombre}">
      <div class="flex items-start gap-3">
        <img src="./assets/images/troops/${normalizarNombre(tropa.nombre)}.png" alt="${tropa.nombre}" class="w-16 h-16 rounded-full">
        <div class="flex flex-col flex-1 min-w-0">
          <h3 class="text-base font-bold">${tropa.nombre}</h3>
          <div class="flex flex-col gap-2 mt-2">
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">HP</span>
                <span class="font-semibold">${tropa.salud}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-red-500 h-2" style="width: ${(tropa.salud / tropa.saludMax * 100)}%"></div>
              </div>
            </div>
            <div class="w-full">
              <div class="flex justify-between text-[0.65rem] mb-1">
                <span class="font-semibold">ATK</span>
                <span class="font-semibold">${tropa.fuerza}</span>
              </div>
              <div class="w-full bg-[#483B30] border-4 border-[#483B30] h-4">
                <div class="bg-green-500 h-2" style="width: ${(tropa.fuerza / 100 * 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `; 
}

// Tropa de la siguiente batalla
export function siguienteTropa(tropa, id) {
    return `
    <div id="tropa-siguiente-${id}" class="w-full h-full bg-[#D2B48C] border-4 border-[#775732] rounded text-[#2C2318] flex flex-col items-center justify-center gap-3" data-tropa="${tropa.nombre}">
      <img src="./assets/images/troops/${normalizarNombre(tropa.nombre)}.png" alt="${tropa.nombre}" class="w-16 h-16 rounded-full border-4 border-[#775732]">
      <h3 class="text-base font-bold text-center">Siguiente Tropa</h3>
    </div>
  `; 
}