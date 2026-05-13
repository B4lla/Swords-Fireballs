// Constructor genérico de menús/listados.
// El builder crea el rectángulo base de cada item y tú solo le pasas el HTML interior.
// Sirve para tienda, ejército, despedir, inventario, habilidades, etc.

const versionesRender = new Map();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tiempoAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BASE_ITEM_CLASS =
  "bg-[#D2B48C] border-4 border-[#775732] rounded-lg p-3 w-[min(95vw,28rem)] text-[#2C2318]";

function crearWrapperItem({ menuId, index, html, itemClassName = "", usarBaseItem = true }) {
  const wrapper = document.createElement("div");
  wrapper.className = "w-full flex justify-center";
  wrapper.dataset.menuId = menuId;
  wrapper.dataset.menuItemIndex = String(index);

  if (usarBaseItem) {
    wrapper.innerHTML = `
      <div class="${BASE_ITEM_CLASS} ${itemClassName}" data-menu-card="true">
        ${html}
      </div>
    `;
  } else {
    wrapper.className = `w-full flex justify-center ${itemClassName}`.trim();
    wrapper.innerHTML = html;
  }

  return wrapper;
}

function loaderPorDefecto(_item, index) {
  return `
    <div class="flex items-center justify-center min-h-[120px] w-full">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#775732] border-t-[#CB9039]"></div>
        <p class="text-sm font-semibold">Cargando item ${index + 1}...</p>
      </div>
    </div>
  `;
}

function prepararClickDelegado({ contenedor, menuId, getItems, onItemClick }) {
  if (contenedor.__menuHandler) {
    contenedor.removeEventListener("click", contenedor.__menuHandler);
  }

  contenedor.__menuHandler = event => {
    const itemElement = event.target.closest(`[data-menu-id="${menuId}"][data-menu-item-index]`);
    if (!itemElement || !contenedor.contains(itemElement)) return;

    const index = Number(itemElement.dataset.menuItemIndex);
    const item = getItems()[index];
    if (!item) return;

    const accion = event.target.closest("[data-item-action]")?.dataset.itemAction || null;

    onItemClick?.({
      item,
      index,
      accion,
      event,
      itemElement,
      contenedor,
      menuId
    });
  };

  contenedor.addEventListener("click", contenedor.__menuHandler);
}

/**
 * Crea/renderiza un menú genérico.
 *
 * El builder pone el rectángulo base. Tú pasas el contenido HTML de dentro.
 * Ejemplo:
 *
 * crearMenu({
 *   menuId: "tienda",
 *   contenedorId: "tropas-reclutar",
 *   items: tropas,
 *   asincrono: true,
 *   minDelay: 2000,
 *   maxDelay: 5000,
 *   renderContenidoItem: (tropa, index, contador) => `
 *     <div id="tropa-${contador}" class="flex items-center gap-3">
 *       <span>${tropa.nombre}</span>
 *       <button data-item-action="comprar">Comprar</button>
 *     </div>
 *   `,
 *   onItemClick: ({ item, accion }) => {
 *     if (accion === "comprar") comprar(item);
 *   }
 * });
 */
export async function crearMenu({
  menuId,
  contenedorId,
  items = [],
  renderContenidoItem,
  onItemClick,
  asincrono = false,
  renderLoader = loaderPorDefecto,
  minDelay = 300,
  maxDelay = 900,
  itemClassName = "",
  limpiar = true,
  usarBaseItem = true
}) {
  const contenedor = document.getElementById(contenedorId);

  if (!contenedor) {
    console.warn(`No existe el contenedor #${contenedorId}`);
    return;
  }

  if (!menuId) {
    throw new Error("crearMenu necesita un menuId.");
  }

  if (typeof renderContenidoItem !== "function") {
    throw new Error("crearMenu necesita una función renderContenidoItem.");
  }

  const versionActual = (versionesRender.get(contenedorId) || 0) + 1;
  versionesRender.set(contenedorId, versionActual);

  const getItems = () => items;
  prepararClickDelegado({ contenedor, menuId, getItems, onItemClick });

  if (limpiar) {
    contenedor.replaceChildren();
  }

  if (!asincrono) {
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      fragment.appendChild(
        crearWrapperItem({
          menuId,
          index,
          html: renderContenidoItem(item, index, index + 1),
          itemClassName,
          usarBaseItem
        })
      );
    });

    contenedor.appendChild(fragment);
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    const loader = crearWrapperItem({
      menuId,
      index,
      html: renderLoader(item, index),
      itemClassName,
      usarBaseItem
    });
    loader.dataset.loader = "true";
    fragment.appendChild(loader);
  });

  contenedor.appendChild(fragment);

  const tareas = items.map(async (item, index) => {
    await delay(tiempoAleatorio(minDelay, maxDelay));

    // Si se renderiza el mismo contenedor de nuevo mientras carga,
    // esta promesa antigua no puede tocar el DOM.
    if (versionesRender.get(contenedorId) !== versionActual) return;

    const loader = contenedor.querySelector(
      `[data-menu-id="${menuId}"][data-menu-item-index="${index}"][data-loader="true"]`
    );

    if (!loader) return;

    loader.replaceWith(
      crearWrapperItem({
        menuId,
        index,
        html: renderContenidoItem(item, index, index + 1),
        itemClassName,
        usarBaseItem
      })
    );
  });

  // Forma normal: lanza todas las cargas a la vez y espera a que estén todas.
  await Promise.all(tareas);
}

export function limpiarMenu(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (contenedor) contenedor.replaceChildren();
  versionesRender.set(contenedorId, (versionesRender.get(contenedorId) || 0) + 1);
}
