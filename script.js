// --- CONFIGURACIÓN E INICIALIZACIÓN ---
// Se asume que INITIAL_GAME_STATE y createCardElement están cargados.
let GAME_STATE = {}; 
let gameIsOver = false;

// --- FUNCIONES DE UTILIDAD ---

function showGameMessage(message, type = 'yellow') {
    const msgBox = document.getElementById('message-box');
    if (!msgBox) return;
    
    msgBox.className = 'fixed top-0 left-0 right-0 p-4 text-center font-bold transition-all';
    
    if (type === 'success') {
        msgBox.classList.add('bg-green-500', 'text-green-900');
    } else if (type === 'error') {
        msgBox.classList.add('bg-red-500', 'text-red-900');
    } else if (type === 'info') {
        msgBox.classList.add('bg-blue-500', 'text-blue-900');
    } else { // default: yellow
        msgBox.classList.add('bg-yellow-500', 'text-yellow-900');
    }

    msgBox.textContent = message;
    msgBox.classList.remove('hidden');

    setTimeout(() => {
        msgBox.classList.add('hidden');
    }, 3000);
}

// Función para cambiar de vista (Menú <-> Juego <-> Colección)
function switchView(targetId) {
    const screens = ['menu-screen', 'game-screen', 'collection-screen'];
    
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            if (id === targetId) {
                screen.classList.remove('hidden');
            } else {
                screen.classList.add('hidden');
            }
        }
    });

    // Lógica especial al entrar a la Colección
    if (targetId === 'collection-screen') {
        renderAllCards(GAME_STATE.cardDefinitions);
    }
}

// --- FUNCIONES DE RENDERIZADO ---

function renderResources(playerKey) {
    const player = GAME_STATE[playerKey];
    const resources = player.resources;
    const defs = GAME_STATE.game.resourceDefinitions;
    
    document.getElementById('res-tiempo').textContent = `${resources.tiempo}/${defs.tiempo.max}`;
    document.getElementById('res-inspiracion').textContent = `${resources.inspiracion}/${defs.inspiracion.max}`;
    // Formato de presupuesto como dinero
    document.getElementById('res-presupuesto').textContent = `$${resources.presupuesto}`;
}

function renderScores() {
    const playerKey = GAME_STATE.game.currentPlayer;
    const player = GAME_STATE[playerKey];
    const scores = player.scores;
    const thresholds = GAME_STATE.game.victoryThresholds;
    const maxTurns = GAME_STATE.game.maxTurns;

    // Scores del jugador actual
    document.getElementById('score-impacto').textContent = `${scores.impactoVisual}/${thresholds.impactoVisual}`;
    document.getElementById('score-usabilidad').textContent = `${scores.usabilidadUX}/${thresholds.usabilidadUX}`;
    document.getElementById('score-cohesion').textContent = `${scores.cohesionMarca}/${thresholds.cohesionMarca}`;

    // Info de la partida
    document.getElementById('turn-count').textContent = GAME_STATE.game.currentTurn;
    document.getElementById('max-turn-count').textContent = maxTurns;
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

// 3. Renderiza la mano de cartas del jugador actual
function renderHand(playerKey) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    
    const player = GAME_STATE[playerKey];
    const definitions = GAME_STATE.cardDefinitions;

    player.hand.forEach(cardKey => {
        const cardDef = definitions[cardKey];
        // Usamos la función del archivo collection_logic para crear el elemento
        const cardElement = createCardElement(cardKey, cardDef, player.resources, playCard);
        handContainer.appendChild(cardElement);
    });
}

/**
 * Calcula el puntaje total de Brief (PB) de un jugador.
 * @param {string} playerKey - 'player1' o 'player2'.
 * @returns {number} Puntaje total.
 */
function calculateTotalScore(playerKey) {
    const scores = GAME_STATE[playerKey].scores;
    // La suma simple de todos los puntos de brief
    return scores.impactoVisual + scores.usabilidadUX + scores.cohesionMarca;
}

/**
 * Determina quién es el líder actual y actualiza el indicador.
 */
function checkLeadership() {
    const score1 = calculateTotalScore('player1');
    const score2 = calculateTotalScore('player2');
    const leaderIndicator = document.getElementById('leader-indicator');

    let leaderName = 'Empate';
    let leaderColor = 'bg-[#433c67]'; // Gris/púrpura para empate

    if (score1 > score2) {
        leaderName = GAME_STATE.player1.name;
        leaderColor = 'bg-yellow-500 text-gray-900';
    } else if (score2 > score1) {
        leaderName = GAME_STATE.player2.name;
        leaderColor = 'bg-red-500 text-white';
    }

    leaderIndicator.textContent = `Líder: ${leaderName}`;
    // Se actualiza la clase para cambiar el color del indicador visual
    leaderIndicator.className = `text-sm font-semibold py-1 px-3 rounded-full ${leaderColor} transition-all duration-300`;
}

// Función principal para actualizar toda la interfaz
function updateUI() {
    const playerKey = GAME_STATE.game.currentPlayer;
    renderResources(playerKey);
    renderScores();
    renderHand(playerKey);
    checkLeadership(); // Chequea y muestra el liderazgo al final de cada acción
}

// --- LÓGICA DE JUEGO CENTRAL ---

function handleGameEnd(winner) {
    gameIsOver = true;
    document.getElementById('btnEndTurn').disabled = true;

    if (winner) {
        showGameMessage(`🎉 ¡FIN DE PARTIDA! ${winner.name} ha completado el Brief y GANA!`, 'success');
    } else {
        const score1 = calculateTotalScore('player1');
        const score2 = calculateTotalScore('player2');
        let finalWinner = '';

        if (score1 > score2) {
            finalWinner = GAME_STATE.player1.name;
        } else if (score2 > score1) {
            finalWinner = GAME_STATE.player2.name;
        } else {
            finalWinner = 'Nadie (¡EMPATE!)';
        }

        showGameMessage(`⏱️ ¡FIN DE PARTIDA por límite de turnos! El ganador por Puntos de Brief es: ${finalWinner}`, 'info');
    }
}

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
            const cardToDraw = player.deck.pop();
            if (cardToDraw) {
                player.hand.push(cardToDraw);
                showGameMessage(`¡${player.name} roba 1 carta!`, 'info');
            } else {
                // Si no hay mazo, barajamos el descarte y robamos
                if (player.discard.length > 0) {
                    player.deck = player.discard;
                    player.discard = [];
                    // Barajar el mazo (simulación)
                    player.deck.sort(() => Math.random() - 0.5); 
                    const cardToDraw = player.deck.pop();
                    if (cardToDraw) player.hand.push(cardToDraw);
                    showGameMessage("¡Barajando y Robando! El juego continúa.", 'info');
                } else {
                     showGameMessage("El mazo y el descarte están vacíos. No hay cartas para robar.", 'error');
                }
            }
        } else if (effect.type === "resource_gain") {
            // Recurso extra para el próximo turno
            player.extraRegen[effect.target] += effect.value;
            showGameMessage(`¡${player.name} obtiene +${effect.value} ${effect.target} extra el próximo turno!`, 'info');
        } else if (effect.type === "resource_immediate") {
            // NUEVO: Ganancia inmediata de recurso (usado para presupuesto)
            player.resources[effect.target] += effect.value;
            // Mostrar la ganancia de presupuesto con formato de dinero
            if (effect.target === 'presupuesto') {
                 showGameMessage(`¡${player.name} gana $${effect.value} USD de ${effect.target}!`, 'success');
            } else {
                showGameMessage(`¡${player.name} gana +${effect.value} ${effect.target} al instante!`, 'success');
            }
        }
    };

    if (cardDef.effect.type === "multiple") {
        cardDef.effect.effects.forEach(executeEffect);
    } else {
        executeEffect(cardDef.effect);

        // Manejo de sideEffect para cartas con efectos secundarios (ej: ganar dinero y score)
        if (cardDef.effect.sideEffect) {
            executeEffect(cardDef.effect.sideEffect);
        }
    }
}

function playCard(cardKey) {
    if (gameIsOver) {
        showGameMessage("El juego ha terminado. Por favor, reinicia.", 'error');
        return;
    }
    
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
        handleGameEnd(player);
    }
    
    // 6. Actualizar UI
    updateUI();
}

function endTurn() {
    if (gameIsOver) return;

    const currentPlayerKey = GAME_STATE.game.currentPlayer;
    const nextPlayerKey = currentPlayerKey === 'player1' ? 'player2' : 'player1';
    const nextPlayer = GAME_STATE[nextPlayerKey];
    const defs = GAME_STATE.game.resourceDefinitions;

    // --- FASE 1: Chequeo de fin de partida por turnos ---
    // Si el turno actual es el máximo, terminamos el juego ANTES de empezar el siguiente turno.
    if (GAME_STATE.game.currentTurn >= GAME_STATE.game.maxTurns) {
        handleGameEnd(null); // Fin por límite de turnos, sin ganador directo
        return;
    }
    
    // --- FASE 2: Recarga (Regen del Siguiente Jugador) ---
    for (const res in defs) {
        let regenAmount = defs[res].regen + nextPlayer.extraRegen[res];
        
        // El presupuesto no se recarga automáticamente (regen=0)
        if (res !== 'presupuesto') {
            nextPlayer.resources[res] += regenAmount;

            // Aplicar límite
            if (nextPlayer.resources[res] > defs[res].max) {
                nextPlayer.resources[res] = defs[res].max;
            }
        }
        
        // Resetear la regeneración extra (si aplica)
        nextPlayer.extraRegen[res] = 0;
    }

    // Robar 1 carta
    const cardToDraw = nextPlayer.deck.pop();
    if (cardToDraw) {
        nextPlayer.hand.push(cardToDraw);
    } else {
         // Lógica de barajar descarte a mazo si no hay cartas
        if (nextPlayer.discard.length > 0) {
            nextPlayer.deck = nextPlayer.discard;
            nextPlayer.discard = [];
            nextPlayer.deck.sort(() => Math.random() - 0.5); 
            const cardToDraw = nextPlayer.deck.pop();
            if (cardToDraw) nextPlayer.hand.push(cardToDraw);
            showGameMessage("¡Barajando y Robando! El juego continúa.", 'info');
        } else {
             showGameMessage("El mazo y el descarte están vacíos. No hay cartas para robar.", 'error');
        }
    }

    // --- FASE 3: Cambio de Turno ---
    GAME_STATE.game.currentPlayer = nextPlayerKey;
    GAME_STATE.game.currentTurn++;

    showGameMessage(`Turno ${GAME_STATE.game.currentTurn}: ¡Es el turno de ${nextPlayer.name}!`, 'yellow');
    
    // --- FASE 4: Actualizar UI y Preparar para el Siguiente Jugador ---
    updateUI();
}

// --- LÓGICA DE EVENTOS E INICIO ---

document.addEventListener('DOMContentLoaded', () => {
    // Función para reiniciar el estado del juego
    const resetGame = () => {
        // Clonación profunda del estado inicial
        GAME_STATE = JSON.parse(JSON.stringify(INITIAL_GAME_STATE)); 
        gameIsOver = false;
        document.getElementById('btnEndTurn').disabled = false;
    }

    resetGame(); // Inicializa el estado al cargar

    // Botón JUGAR (Inicio de la partida)
    document.getElementById('btnPlay').addEventListener('click', () => {
        resetGame(); // Asegura un juego nuevo
        showGameMessage("¡Iniciando Batalla! Cargando el Brief...");
        switchView('game-screen');
        updateUI(); 
    });

    // Botón COLECCIÓN DE CARTAS
    document.getElementById('btnCollection').addEventListener('click', () => {
        switchView('collection-screen');
        showGameMessage("Explorando el Portafolio de Cartas...", 'info');
    });

    // Botón REGRESAR desde Colección
    document.getElementById('btnCollectionBack').addEventListener('click', () => {
        switchView('menu-screen');
    });

    // Botón FIN DE TURNO
    document.getElementById('btnEndTurn').addEventListener('click', endTurn);

    // Otros eventos de menú
    document.getElementById('btnTutorial').addEventListener('click', () => showGameMessage("Accediendo al Tutorial: Aprendiendo a Kerning...", 'info'));
    document.getElementById('btnSettings').addEventListener('click', () => showGameMessage("Abriendo Ajustes: ¿Quieres cambiar tu paleta de colores?", 'info'));
    document.getElementById('btnCredits').addEventListener('click', () => showGameMessage("Diseño inspirado por la comunidad creativa. ¡Gracias!", 'info'));
});
