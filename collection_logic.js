/**
 * collection_logic.js
 * Contiene funciones para renderizar visualmente las cartas.
 * Se utiliza en la mano del jugador (script.js) y en la vista de colección (index.html).
 */

const COST_COLOR_MAP = {
    tiempo: { color: 'bg-[#ff6584] text-white', symbol: '⏱️' },
    inspiracion: { color: 'bg-[#8dff8d] text-gray-900', symbol: '✨' },
    presupuesto: { color: 'bg-[#f5f5f5] text-gray-900', symbol: '💵' } // Color ajustado para el presupuesto
};

/**
 * Genera una descripción detallada de los efectos de la carta para el portafolio.
 * @param {object} effect - El objeto effect de la definición de la carta.
 * @returns {string} Una cadena HTML formateada con los efectos.
 */
function getEffectDescription(effect) {
    const listItems = [];

    const processSingleEffect = (eff) => {
        let description = '';
        if (eff.type === "score") {
            const scoreMap = {
                impactoVisual: 'Impacto Visual (IV)',
                usabilidadUX: 'Usabilidad/UX (UX)',
                cohesionMarca: 'Cohesión Marca (CM)'
            };
            description = `➕ ${eff.value} PB en ${scoreMap[eff.target]}.`;
        } else if (eff.type === "draw") {
            description = `➕ Roba ${eff.value} carta.`;
        } else if (eff.type === "resource_gain") {
            description = `➕ ${eff.value} ${eff.target} extra en el siguiente turno.`;
        } else if (eff.type === "resource_immediate") {
            const value = eff.target === 'presupuesto' ? `$${eff.value}` : eff.value;
            description = `➕ Gana ${value} ${eff.target} al instante.`;
        }
        listItems.push(`<li>${description}</li>`);
    };

    if (effect.type === "multiple") {
        effect.effects.forEach(processSingleEffect);
    } else {
        processSingleEffect(effect);
    }
    
    // Si hay un efecto secundario (sideEffect), también lo procesamos
    if (effect.sideEffect) {
        processSingleEffect(effect.sideEffect);
    }

    return `<ul class="list-disc list-inside text-xs text-left mt-2 text-green-300 font-semibold">${listItems.join('')}</ul>`;
}


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
            
            const chip = COST_COLOR_MAP[res];
            const costDisplay = res === 'presupuesto' ? `$${cost}` : cost;
            
            costChips += `<span class="cost-chip ${chip.color} ${isAffordable ? '' : 'opacity-50 line-through'}" title="${cost} ${res}">${chip.symbol} ${costDisplay}</span>`;
        }
    }

    if (!canAfford && playerResources) {
        cardElement.classList.add('opacity-70', 'cursor-not-allowed', 'hover:transform-none', 'hover:shadow-none');
    } else if (clickHandler) {
        cardElement.addEventListener('click', () => clickHandler(cardKey));
        cardElement.classList.add('playable-card');
    } else {
        // Estilo para cartas de solo visualización (Colección)
        cardElement.classList.add('border-none'); 
        cardElement.classList.remove('card:hover'); 
    }
    
    // Obtener la descripción detallada de los efectos
    const detailedEffects = getEffectDescription(cardDef.effect);

    // Contenido HTML de la carta
    cardElement.innerHTML = `
        <div>
            <h4 class="text-lg font-bold text-white mb-1">${cardDef.name}</h4>
            <p class="text-[10px] text-[#a0a0c0] uppercase">${cardDef.description}</p>
            <div class="card-cost mt-2">${costChips}</div>
            
            <div class="mt-2 p-2 bg-[#272343] rounded-md border border-green-700/50">
                <p class="text-xs font-bold text-green-400">Efectos al Jugar:</p>
                ${detailedEffects}
            </div>
        </div>
        <p class="text-xs text-right text-[#a0a0c0] font-mono mt-2">${cardKey}</p>
    `;

    return cardElement;
}

/**
 * Renderiza todas las cartas en la vista de colección.
 * Esta función es llamada cuando el usuario accede al "Portafolio de Cartas".
 */
function renderAllCards(cardDefinitions) {
    const container = document.getElementById('all-cards-container');
    if (!container) return;

    container.innerHTML = '';
    
    const cardKeys = Object.keys(cardDefinitions).sort(); // Ordenar alfabéticamente
    
    cardKeys.forEach(cardKey => {
        const cardDef = cardDefinitions[cardKey];
        // En la colección, no pasamos recursos ni handler, solo la definición
        const cardElement = createCardElement(cardKey, cardDef); 
        container.appendChild(cardElement);
    });

    if (cardKeys.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full text-lg text-red-400">¡Error! No se encontraron definiciones de cartas.</p>';
    }
}
