/**
 * Crea el elemento para una carta, reutilizable para la mano y la colección.
 * @param {string} cardKey - La clave de la carta (e.g., 'Tipografia_Audaz').
 * @param {object} cardDef - La definición completa de la carta.
 * @param {object} playerResources - Los recursos actuales del jugador (para chequear si puede jugar).
 * @param {function} playCardCallback - Función a llamar si la carta se juega (solo para la mano).
 * @returns {HTMLElement} El elemento DIV de la carta.
 */
function createCardElement(cardKey, cardDef, playerResources = null, playCardCallback = null) {
    const cardElement = document.createElement('div');
    
    // Asignar clases base y jugabilidad
    let cardClasses = 'card rounded-lg shadow-lg flex flex-col justify-between transition-all duration-100';
    if (playCardCallback) {
        cardClasses += ' playable-card hover:border-[#ff6584]';
    }

    // Chequear si la carta está inhabilitada (solo si se proporcionan recursos y callback)
    let isDisabled = false;
    if (playerResources && playCardCallback) {
        for (const [res, cost] of Object.entries(cardDef.cost)) {
            if (playerResources[res] < cost) {
                isDisabled = true;
                break;
            }
        }
    }
    
    if (isDisabled) {
        cardClasses += ' opacity-50 cursor-not-allowed grayscale';
    }

    cardElement.className = cardClasses;
    cardElement.style.borderColor = cardDef.color || '#b8c1ec';
    
    // Contenido del Costo
    const costHtml = Object.entries(cardDef.cost).map(([res, cost]) => {
        let chipClass = '';
        let chipSymbol = '';
        if (res === 'tiempo') {
            chipClass = 'bg-[#ff6584] text-white';
            chipSymbol = '⏱️';
        } else if (res === 'inspiracion') {
            chipClass = 'bg-[#8dff8d] text-gray-900';
            chipSymbol = '✨';
        } else if (res === 'presupuesto') {
            chipClass = 'bg-[#f5f58c] text-gray-900';
            chipSymbol = '💵';
            cost = `$${cost}`; // Formato de dinero
        }
        return `<span class="cost-chip ${chipClass}">${cost} ${chipSymbol}</span>`;
    }).join('');

    // Contenido de los Efectos
    let effectHtml = '';
    const renderEffect = (effect) => {
        let effectColor = '';
        let effectIcon = '';

        if (effect.type === "score") {
            effectColor = `text-[${effect.target === 'impactoVisual' ? '#ff6584' : effect.target === 'usabilidadUX' ? '#8dff8d' : '#8d8dff'}]`;
            effectIcon = '➕';
            return `<p class="text-xs ${effectColor} font-bold">${effectIcon} ${effect.value} PB (${effect.target.substring(0, 3).toUpperCase()})</p>`;
        } else if (effect.type === "draw") {
            effectColor = 'text-[#f5f58c]';
            effectIcon = '⬆️';
            return `<p class="text-xs ${effectColor} font-bold">${effectIcon} Roba ${effect.value} Carta(s)</p>`;
        } else if (effect.type === "resource_gain") {
            effectColor = 'text-[#b8c1ec]';
            effectIcon = '⚡';
            return `<p class="text-xs ${effectColor} font-bold">${effectIcon} +${effect.value} ${effect.target} (Prox. Turno)</p>`;
        } else if (effect.type === "resource_immediate") {
            effectColor = 'text-[#b8c1ec]';
            effectIcon = '⚡';
            let valueText = effect.target === 'presupuesto' ? `$${effect.value}` : `+${effect.value}`;
            return `<p class="text-xs ${effectColor} font-bold">${effectIcon} ${valueText} ${effect.target}</p>`;
        }
        return '';
    };

    if (cardDef.effect.type === "multiple") {
        effectHtml = cardDef.effect.effects.map(renderEffect).join('');
    } else {
        effectHtml = renderEffect(cardDef.effect);
        if (cardDef.effect.sideEffect) {
            effectHtml += renderEffect(cardDef.effect.sideEffect);
        }
    }


    // Estructura completa de la carta
    cardElement.innerHTML = `
        <div class="card-header flex justify-start items-start">
            <div class="card-cost">${costHtml}</div>
        </div>

        <div class="flex-grow text-center my-1">
            <p class="text-sm font-extrabold mb-1 uppercase" style="color: ${cardDef.color || '#b8c1ec'};">${cardDef.name}</p>
            <p class="text-[0.6rem] text-gray-400 italic">${cardDef.description}</p>
        </div>

        <div class="card-footer p-1 border-t border-dashed" style="border-color: ${cardDef.color || '#3b3558'};">
            ${effectHtml}
        </div>
    `;

    // Añadir el listener para la mano del jugador
    if (playCardCallback && !isDisabled) {
        cardElement.addEventListener('click', () => {
            playCardCallback(cardKey);
        });
    }

    return cardElement;
}

/**
 * Renderiza todas las cartas para la pantalla de colección.
 * @param {object} cardDefinitions - El objeto CARD_DEFINITIONS.
 */
function renderAllCards(cardDefinitions) {
    const container = document.getElementById('all-cards-container');
    if (!container) return;

    container.innerHTML = ''; // Limpiar el contenedor

    // Convertir el objeto de definiciones a un array de claves y ordenarlo por color/tipo
    const cardKeys = Object.keys(cardDefinitions);
    const sortedKeys = cardKeys.sort((a, b) => {
        const colorA = cardDefinitions[a].color || '#ffffff';
        const colorB = cardDefinitions[b].color || '#ffffff';
        
        // Simple ordenación por color para agrupar cartas similares
        if (colorA < colorB) return -1;
        if (colorA > colorB) return 1;
        return 0;
    });

    sortedKeys.forEach(cardKey => {
        const cardDef = cardDefinitions[cardKey];
        // Crea la carta sin listeners ni chequeo de recursos (es solo visual)
        const cardElement = createCardElement(cardKey, cardDef, null, null);
        
        // Ajustar el estilo para la colección (hacerlas más grandes o distintas si es necesario)
        cardElement.classList.remove('playable-card');
        cardElement.style.cursor = 'default';
        
        container.appendChild(cardElement);
    });
}
