// --- CONFIGURACIÓN E INICIALIZACIÓN ---
let GAME_STATE = {}; 

// --- FUNCIONES DE UTILIDAD ---

function showGameMessage(message, type = 'yellow') {
    const msgBox = document.getElementById('message-box');
    if (!msgBox) return;
    
    msgBox.className = 'fixed top-0 left-0 right-0 p-4 text-center font-bold transition-all';
    
    if (type === 'success') {
        msgBox.classList.add('bg-green-500', 'text-green-900');
    } else if (type === 'error') {
        msgBox.classList.add('bg-red-500', 'text-red-900');
    } else { // default: yellow
        msgBox.classList.add('bg-yellow-500', 'text-yellow-900');
    }

    msgBox.textContent = message;
    msgBox.classList.remove('hidden');

    setTimeout(() => {
        msgBox.classList.add('hidden');
    }, 3000);
}

function switchView(targetId) {
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');

    if (targetId === 'game') {
        menuScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    } else if (targetId === 'menu') {
        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    }
}

// --- FUNCIONES DE RENDERIZADO ---

function renderResources(playerKey) {
    const player = GAME_STATE[playerKey];
    const resources = player.resources;
    const defs = GAME_STATE.game.resourceDefinitions;
    
    document.getElementById('res-tiempo').textContent = `${resources.tiempo}/${defs.tiempo.max}`;
    document.getElementById('res-inspiracion').textContent = `${resources.inspiracion}/${defs.inspiracion.max}`;
    document.getElementById('res-presupuesto').textContent = `${resources.presupuesto}`;
}

function renderScores() {
    const playerKey = GAME_STATE.game.currentPlayer;
    const player = GAME_STATE[playerKey];
    const scores = player.scores;
    const thresholds = GAME_STATE.game.victoryThresholds;

    // Scores del jugador actual
    document.getElementById('score-impacto').textContent = `${scores.impactoVisual}/${thresholds.impactoVisual}`;
    document.getElementById('score-usabilidad').textContent = `${scores.usabilidadUX}/${thresholds.usabilidadUX}`;
    document.getElementById('score-cohesion').textContent = `${scores.cohesionMarca}/${thresholds.cohesionMarca}`;

    // Info de la partida
    document.getElementById('turn-count').textContent = GAME_STATE.game.currentTurn;
    document.getElementById('current-player-name').textContent = player.name;

    // Renderizar Oponente 
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    const oppScores = GAME_STATE[opponentKey].scores;
    const oppThresholds = GAME_STATE.game.victoryThresholds;
    document.getElementById('opponent-name').textContent = GAME_STATE[opponentKey].name;

    document.getElementById('opponent-scores').innerHTML = `
        <p class="text-[#ff6584]">Impacto: <strong>${oppScores.impactoVisual}/${oppThresholds.impactoVisual}</strong></p>
        <p class="text-[#8dff8d]">Usabilidad: <strong>${oppScores.usabilidadUX}/${oppThresholds.usabilidadUX}</strong></p>
        <p class="text-[#8d8dff]">Cohesión: <strong>${oppScores.cohesionMarca}/${oppThresholds.cohesionMarca}</strong></p>
    `;
}

function renderHand(playerKey) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    
    const playerHand = GAME_STATE[playerKey].hand;
    const definitions = GAME_STATE.cardDefinitions;
    const playerResources = GAME_STATE[playerKey].resources;

    playerHand.forEach(cardKey => {
        const cardDef = definitions[cardKey];
        const cardElement = document.createElement('div');
        cardElement.className = 'card rounded-lg shadow-xl flex flex-col justify-between';
        cardElement.setAttribute('data-card-id', cardKey);

        // Comprobar si se puede pagar la carta (para feedback visual)
        let canAfford = true;
        let costChips = '';
        const costColorMap = {
            tiempo: { color: 'bg-[#ff6584] text-white', symbol: '⏱️' },
            inspiracion: { color: 'bg-[#8dff8d] text-gray-900', symbol: '✨' },
            presupuesto: { color: 'bg-[#f5f58c] text-gray-900', symbol: '💵' }
        };

        for (const [res, cost] of Object.entries(cardDef.cost)) {
            if (cost > 0) {
                const isAffordable = playerResources[res] >= cost;
                if (!isAffordable) canAfford = false;
                
                const chipColor = costColorMap[res].color;
                const symbol = costColorMap[res].symbol;
                costChips += `<span class="cost-chip ${chipColor} ${isAffordable ? '' : 'opacity-50 line-through'}">${symbol} ${cost}</span>`;
            }
        }
        
        if (!canAfford) {
            cardElement.classList.add('opacity-70', 'cursor-not-allowed', 'hover:transform-none', 'hover:shadow-none');
            cardElement.classList.remove('card:hover');
        } else {
            cardElement.addEventListener('click', () => playCard(cardKey));
        }

        cardElement.innerHTML = `
            <div>
                <h4 class="text-lg font-bold text-white mb-1">${cardDef.name}</h4>
                <div class="card-cost">${costChips}</div>
                <p class="text-xs text-[#bae8e8]">${cardDef.description}</p>
            </div>
            <p class="text-xs text-right text-[#a0a0c0] font-mono">${cardKey}</p>
        `;

        handContainer.appendChild(cardElement);
    });
}

// Función principal para actualizar toda la interfaz
function updateUI() {
    const playerKey = GAME_STATE.game.currentPlayer;
    renderResources(playerKey);
    renderScores();
    renderHand(playerKey);
}

// --- LÓGICA DE JUEGO CENTRAL ---

function checkVictory(player) {
    const scores = GAME_STATE[player].scores;
    const thresholds = GAME_STATE.game.victoryThresholds;

    return (
        scores.impactoVisual >= thresholds.impactoVisual &&
        scores.usabilidadUX >= thresholds.usabilidadUX &&
        scores.cohesionMarca >= thresholds.cohesionMarca
    );
}

function applyCardEffects(cardDef, playerKey) {
    const player = GAME_STATE[playerKey];
    
    // Función recursiva para manejar efectos múltiples
    const executeEffect = (effect) => {
        if (effect.type === "score") {
            player.scores[effect.target] += effect.value;
            showGameMessage(`¡${player.name} gana +${effect.value} PB en ${effect.target}!`, 'success');
        } else if (effect.type === "draw") {
            // Por simplicidad, solo roba de lo que está en el mazo inicial
            const cardToDraw = player.deck.pop();
            if (cardToDraw) {
                player.hand.push(cardToDraw);
                showGameMessage(`¡${player.name} roba 1 carta!`, 'success');
            }
        } else if (effect.type === "resource_gain") {
            // Aplica el recurso extra como regeneración para el próximo turno
            player.extraRegen[effect.target] += effect.value;
            showGameMessage(`¡${player.name} obtiene +${effect.value} ${effect.target} extra el próximo turno!`, 'success');
        }
    };

    if (cardDef.effect.type === "multiple") {
        cardDef.effect.effects.forEach(executeEffect);
    } else {
        executeEffect(cardDef.effect);
    }
}

function playCard(cardKey) {
    const playerKey = GAME_STATE.game.currentPlayer;
    const player = GAME_STATE[playerKey];
    const cardDef = GAME_STATE.cardDefinitions[cardKey];
    let canAfford = true;

    // 1. Verificar Recursos
    for (const [res, cost] of Object.entries(cardDef.cost)) {
        if (player.resources[res] < cost) {
            canAfford = false;
            break;
        }
    }

    if (!canAfford) {
        showGameMessage("No tienes suficientes recursos para jugar esta carta.", 'error');
        return;
    }

    // 2. Aplicar Costo
    for (const [res, cost] of Object.entries(cardDef.cost)) {
        player.resources[res] -= cost;
    }

    // 3. Aplicar Efecto
    applyCardEffects(cardDef, playerKey);

    // 4. Mover carta: Mano -> Descarte
    const cardIndex = player.hand.indexOf(cardKey);
    if (cardIndex !== -1) {
        player.hand.splice(cardIndex, 1);
        player.discard.push(cardKey);
    }

    // 5. Comprobar Victoria
    if (checkVictory(playerKey)) {
        showGameMessage(`🎉 ¡VICTORIA! El ${player.name} ha completado el Brief!`, 'success');
        document.getElementById('btnEndTurn').disabled = true;
        // Lógica de fin de partida...
    }
    
    // 6. Actualizar UI
    updateUI();
}

function endTurn() {
    const currentPlayerKey = GAME_STATE.game.currentPlayer;
    const nextPlayerKey = currentPlayerKey === 'player1' ? 'player2' : 'player1';
    const nextPlayer = GAME_STATE[nextPlayerKey];
    const defs = GAME_STATE.game.resourceDefinitions;

    // --- FASE 1: Recarga (Regen del Siguiente Jugador) ---
    for (const res in defs) {
        // Regeneración base + extraRegen
        let regenAmount = defs[res].regen + nextPlayer.extraRegen[res];

        // Aplicar regeneración
        nextPlayer.resources[res] += regenAmount;

        // Limitar al máximo (Cap)
        if (nextPlayer.resources[res] > defs[res].max) {
            nextPlayer.resources[res] = defs[res].max;
        }

        // Resetear extraRegen
        nextPlayer.extraRegen[res] = 0;
    }

    // Robar 1 carta
    const cardToDraw = nextPlayer.deck.pop();
    if (cardToDraw) {
        nextPlayer.hand.push(cardToDraw);
    } else {
        // Lógica de barajar descarte a mazo si es necesario (no implementada)
    }

    // --- FASE 2: Cambio de Turno ---
    GAME_STATE.game.currentPlayer = nextPlayerKey;
    GAME_STATE.game.currentTurn++;

    showGameMessage(`Turno ${GAME_STATE.game.currentTurn}: ¡Es el turno de ${nextPlayer.name}!`, 'yellow');
    
    // --- FASE 3: Actualizar UI y Preparar para el Siguiente Jugador ---
    updateUI();
}

// --- LÓGICA DE EVENTOS E INICIO ---

document.addEventListener('DOMContentLoaded', () => {
    // Copiar el estado inicial para poder modificarlo durante el juego
    GAME_STATE = JSON.parse(JSON.stringify(INITIAL_GAME_STATE)); 

    // Botón JUGAR (Inicio de la partida)
    document.getElementById('btnPlay').addEventListener('click', () => {
        showGameMessage("¡Iniciando Batalla! Cargando el Brief...");
        switchView('game');
        updateUI(); // Inicializa la interfaz de juego con los datos
    });

    // Botón FIN DE TURNO
    document.getElementById('btnEndTurn').addEventListener('click', endTurn);

    // ... (Otros eventos de menú sin cambios)
    document.getElementById('btnCollection').addEventListener('click', () => showGameMessage("Viendo tu portafolio y colección de cartas..."));
    document.getElementById('btnTutorial').addEventListener('click', () => showGameMessage("Accediendo al Tutorial: Aprendiendo a Kerning..."));
    document.getElementById('btnSettings').addEventListener('click', () => showGameMessage("Abriendo Ajustes: ¿Quieres cambiar tu paleta de colores?"));
    document.getElementById('btnCredits').addEventListener('click', () => showGameMessage("Diseño inspirado por la comunidad creativa. ¡Gracias!"));
});
