/**
 * collection_logic.js
 * Contiene funciones para el renderizado visual de elementos de cartas,
 * utilizado tanto para la mano del jugador como para la pantalla de colección.
 * * Depende de:
 * - lucide: Para la iconografía.
 * - GAME_STATE.cardDefinitions: Para obtener los datos de la carta.
 */

// Símbolos de Recursos
const RESOURCE_SYMBOLS = {
    tiempo: '⏱️ T',
    inspiracion: '✨ I',
    presupuesto: '💵 P'
};

// Clases de color para los chips de costo
const RESOURCE_COLORS = {
    tiempo: 'bg-[#ff6584] text-white',      // Rojo/Rosa
    inspiracion: 'bg-[#8dff8d] text-gray-900', // Verde brillante
    presupuesto: 'bg-[#f5f58c] text-gray-900'   // Amarillo claro
};

/**
 * Crea un chip de costo visual.
 * @param {string} resourceName - Nombre del recurso ('tiempo', 'inspiracion', 'presupuesto').
 * @param {number} cost - Cantidad de recurso requerido.
 * @returns {string} HTML del chip.
 */
function createCostChip(resourceName, cost) {
    if (cost <= 0) return '';

    const symbol = RESOURCE_SYMBOLS[resourceName] || resourceName;
    const color = RESOURCE_COLORS[resourceName] || 'bg-gray-500 text-white';

    return `
        <div class="cost-chip ${color}">
            ${cost} ${symbol}
        </div>
    `;
}

/**
 * Crea el elemento DOM completo de una carta.
 * Esta función es esencial para renderizar tanto la mano como la colección.
 * @param {string} cardKey - La clave única de la carta (ej: "Ajuste_Kerning").
 * @param {object} cardDef - La definición de la carta desde cardDefinitions.
 * @param {object} [playerResources=null] - Recursos del jugador actual (solo para cartas en mano).
 * @param {function} [clickCallback=null] - Función a ejecutar al hacer click (solo para cartas en mano).
 * @returns {HTMLElement} Elemento div de la carta.
 */
function createCardElement(cardKey, cardDef, playerResources = null, clickCallback = null) {
    const cardElement = document.createElement('div');
    cardElement.dataset.cardKey = cardKey;

    let isPlayable = true;
    let tooltip = '';
    let cardClass = 'card rounded-xl shadow-lg transition duration-200';

    if (playerResources && clickCallback) {
        // Lógica para cartas en la mano
        for (const [res, cost] of Object.entries(cardDef.cost)) {
            if (playerResources[res] < cost) {
                isPlayable = false;
                tooltip = ` title="Recursos insuficientes"`;
                break;
            }
        }
        cardClass += isPlayable ? ' playable-card' : ' opacity-50 cursor-not-allowed border-red-500';
        
        if (isPlayable) {
            cardElement.addEventListener('click', () => clickCallback(cardKey));
        }

    } else {
        // Lógica para cartas en la colección (solo visualización)
        cardClass += ' border-none';
    }

    // Generar los chips de costo
    let costHtml = '';
    for (const [res, cost] of Object.entries(cardDef.cost)) {
        costHtml += createCostChip(res, cost);
    }

    // Determinar la clase de color para el nombre de la carta según su impacto principal (primer efecto)
    let titleColor = 'text-[#bae8e8]';
    let mainEffectTarget = cardDef.effect.target || (cardDef.effect.effects && cardDef.effect.effects[0].target);

    if (mainEffectTarget === 'impactoVisual') {
        titleColor = 'text-[#ff6584]'; // Rojo
    } else if (mainEffectTarget === 'usabilidadUX') {
        titleColor = 'text-[#8dff8d]'; // Verde
    } else if (mainEffectTarget === 'cohesionMarca') {
        titleColor = 'text-[#8d8dff]'; // Azul

    } else if (cardDef.effect.type === 'resource_immediate' || cardDef.effect.type === 'resource_gain') {
        titleColor = 'text-[#f5f58c]'; // Amarillo (Recurso)
    }


    // Contenido HTML de la carta
    cardElement.innerHTML = `
        <div class="flex flex-col h-full" ${tooltip}>
            <h4 class="text-sm font-bold leading-tight mb-2 ${titleColor}">${cardDef.name}</h4>
            
            <div class="card-cost">${costHtml}</div>
            
            <p class="text-xs text-gray-300 flex-grow">${cardDef.description}</p>
            
            <div class="absolute bottom-1 right-1 p-1 bg-[#1a1a2e] rounded-tl-lg text-xs font-black text-white">
                ${cardDef.effect.type === 'score' ? `+${cardDef.effect.value} PB` : cardDef.effect.type === 'multiple' ? `Efecto Múltiple` : `Recurso`}
            </div>
        </div>
    `;

    cardElement.className = cardClass;
    return cardElement;
}

/**
 * Renderiza todas las cartas disponibles en la pantalla de colección.
 * @param {object} cardDefinitions - El objeto completo de definiciones de cartas.
 */
function renderAllCards(cardDefinitions) {
    const container = document.getElementById('all-cards-container');
    container.innerHTML = ''; // Limpia el contenedor

    // Obtener las claves y ordenar por nombre para una mejor visualización
    const cardKeys = Object.keys(cardDefinitions).sort((a, b) => 
        cardDefinitions[a].name.localeCompare(cardDefinitions[b].name)
    );

    cardKeys.forEach(cardKey => {
        const cardDef = cardDefinitions[cardKey];
        // Crear la carta sin recursos ni callback (solo visualización)
        const cardElement = createCardElement(cardKey, cardDef);
        container.appendChild(cardElement);
    });
}
