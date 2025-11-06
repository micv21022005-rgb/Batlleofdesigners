/**
 * collection_logic.js
 * Contiene funciones para renderizar visualmente las cartas.
 * Se utiliza en la mano del jugador (script.js) y en la vista de colección (index.html).
 */

const COST_COLOR_MAP = {
    tiempo: { color: 'bg-[#ff6584] text-white', symbol: '⏱️' },
    inspiracion: { color: 'bg-[#8dff8d] text-gray-900', symbol: '✨' },
    presupuesto: { color: 'bg-[#f5f58c] text-gray-900', symbol: '💵' }
};

/**
 * Crea el elemento HTML de una carta dado su definición.
 * @param {string} cardKey - La clave de la carta (ej: "Ajuste_Kerning").
 * @param {object} cardDef - La definición de la carta del game_state.
 * @param {object} playerResources - Los recursos del jugador (opcional, para habilitar/deshabilitar).
 * @param {function} clickHandler - La función a ejecutar al hacer clic (opcional).
 * @returns {HTMLElement} El div de la carta.
 */
function createCardElement(cardKey, cardDef, playerResources = null, clickHandler = null) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card rounded-lg shadow-xl flex flex-col justify-between';
    cardElement.setAttribute('data-card-id', cardKey);
    
    let canAfford = true;
    let costChips = '';

    // Generar chips de costo y verificar si se puede pagar
    for (const [res, cost] of Object.entries(cardDef.cost)) {
        if (cost > 0) {
            const isAffordable = playerResources ? playerResources[res] >= cost : true;
            if (!isAffordable) canAfford = false;
            
            const chipColor = COST_COLOR_MAP[res].color;
            const symbol = COST_COLOR_MAP[res].symbol;
            costChips += `<span class="cost-chip ${chipColor} ${isAffordable ? '' : 'opacity-50 line-through'}" title="${cost} ${res}">${symbol} ${cost}</span>`;
        }
    }

    if (!canAfford && playerResources) {
        cardElement.classList.add('opacity-70', 'cursor-not-allowed', 'hover:transform-none', 'hover:shadow-none');
    } else if (clickHandler) {
        cardElement.addEventListener('click', () => clickHandler(cardKey));
        cardElement.classList.add('playable-card');
    } else {
        // Estilo para cartas de solo visualización (Colección)
        cardElement.classList.add('border-[#3dff6b]', 'cursor-default'); 
        cardElement.classList.remove('card:hover'); 
    }
    
    // Contenido HTML de la carta
    cardElement.innerHTML = `
        <div>
            <h4 class="text-lg font-bold text-white mb-1">${cardDef.name}</h4>
            <div class="card-cost">${costChips}</div>
            <p class="text-xs text-[#bae8e8] min-h-[60px]">${cardDef.description}</p>
        </div>
        <p class="text-xs text-right text-[#a0a0c0] font-mono">${cardKey}</p>
    `;

    return cardElement;
}

/**
 * Renderiza todas las cartas en la vista de colección.
 */
function renderAllCards(cardDefinitions) {
    const container = document.getElementById('all-cards-container');
    if (!container) return;

    container.innerHTML = '';
    
    // Usamos Object.keys para garantizar un orden de renderizado
    Object.keys(cardDefinitions).forEach(cardKey => {
        const cardDef = cardDefinitions[cardKey];
        // En la colección, no pasamos recursos ni handler, solo la definición
        const cardElement = createCardElement(cardKey, cardDef); 
        container.appendChild(cardElement);
    });
}
