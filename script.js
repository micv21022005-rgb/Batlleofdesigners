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
        // Llama a la función del archivo collection_logic.js para renderizar
        if (typeof renderAllCards === 'function') {
            renderAllCards(GAME_STATE.cardDefinitions);
        } else {
            console.error("Error: La función renderAllCards no está disponible.");
        }
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

    if (playerKey === 'player1') { // Solo renderizar la mano del jugador humano
        player.hand.forEach(cardKey => {
            const cardDef = definitions[cardKey];
            const cardElement = createCardElement(cardKey, cardDef, player.resources, playCard);
            handContainer.appendChild(cardElement);
        });
    } else {
        // Mano del oponente: solo mostrar el reverso de las cartas
        for(let i = 0; i < player.hand.length; i++) {
            const hiddenCard = document.createElement('div');
            hiddenCard.className = 'card rounded-xl shadow-lg bg-[#5a547b] border-4 border-[#3b3558] flex items-center justify-center text-lg font-bold text-[#bae8e8]';
            hiddenCard.textContent = 'BETA';
            handContainer.appendChild(hiddenCard);
        }
    }
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

// --- LÓGICA DEL MODAL DE FIN DE PARTIDA ---

function showGameOverModal(title, message, icon) {
    // Asegurarse de que el icono de lucide esté disponible antes de insertarlo
    const iconSvg = typeof lucide !== 'undefined' && lucide.createIcons()[icon] ? lucide.createIcons()[icon].toSvg({ name: icon, class: 'w-16 h-16 mx-auto text-yellow-400' }) : `<div class="text-7xl">🏆</div>`;
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-content-icon').innerHTML = iconSvg;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

function hideGameOverModal() {
    document.getElementById('game-over-modal').classList.add('hidden');
}


// --- LÓGICA DE JUEGO CENTRAL ---

function handleGameEnd(winner) {
    gameIsOver = true;
    document.getElementById('btnEndTurn').disabled = true;

    let modalTitle = "¡FIN DEL BRIEF!";
    let modalMessage = "";
    let modalIcon = 'trophy'; // Icono por defecto (trofeo)

    if (winner) {
        modalTitle = "¡BRIEF CUMPLIDO!";
        modalMessage = `${winner.name} ha alcanzado todos los objetivos y GANA la Batalla de Diseño.`;
        modalIcon = 'award'; 
    } else {
        const score1 = calculateTotalScore('player1');
        const score2 = calculateTotalScore('player2');
        
        if (score1 > score2) {
            const finalWinner = GAME_STATE.player1.name;
            modalMessage = `El tiempo se ha agotado. ¡${finalWinner} gana por mayor puntuación total (PB)!`;
            modalIcon = 'trending-up';
        } else if (score2 > score1) {
            const finalWinner = GAME_STATE.player2.name;
            modalMessage = `El tiempo se ha agotado. ¡${finalWinner} gana por mayor puntuación total (PB)!`;
            modalIcon = 'trending-up';
        } else {
            modalTitle = "¡EMPATE TÉCNICO!";
            modalMessage = 'El tiempo se acabó y ambos diseñadores tienen la misma puntuación de Brief. ¡Es un empate!';
            modalIcon = 'zap';
        }
    }
    
    // Muestra el modal de fin de partida
    showGameOverModal(modalTitle, modalMessage, modalIcon);
}

function checkVictory(playerKey) {
    const scores = GAME_STATE[playerKey].scores;
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
            // Solo mostrar mensajes detallados para el jugador humano
            if (playerKey === 'player1') {
                showGameMessage(`¡${player.name} gana +${effect.value} PB en ${effect.target}!`, 'success');
            }
        } else if (effect.type === "draw") {
            const cardToDraw = player.deck.pop();
            if (cardToDraw) {
                player.hand.push(cardToDraw);
                if (playerKey === 'player1') {
                    showGameMessage(`¡${player.name} roba 1 carta!`, 'info');
                }
            } else {
                // Si no hay mazo, barajamos el descarte y robamos
                if (player.discard.length > 0) {
                    player.deck = player.discard;
                    player.discard = [];
                    // Barajar el mazo (simulación)
                    player.deck.sort(() => Math.random() - 0.5); 
                    const cardToDraw = player.deck.pop();
                    if (cardToDraw) player.hand.push(cardToDraw);
                    if (playerKey === 'player1') {
                        showGameMessage("¡Barajando y Robando! El juego continúa.", 'info');
                    }
                } else {
                     if (playerKey === 'player1') {
                        showGameMessage("El mazo y el descarte están vacíos. No hay cartas para robar.", 'error');
                     }
                }
            }
        } else if (effect.type === "resource_gain") {
            // Recurso extra para el próximo turno
            player.extraRegen[effect.target] += effect.value;
            if (playerKey === 'player1') {
                showGameMessage(`¡${player.name} obtiene +${effect.value} ${effect.target} extra el próximo turno!`, 'info');
            }
        } else if (effect.type === "resource_immediate") {
            // Ganancia inmediata de recurso (usado para presupuesto)
            player.resources[effect.target] += effect.value;
            // Mostrar la ganancia de presupuesto con formato de dinero
            if (playerKey === 'player1') {
                 if (effect.target === 'presupuesto') {
                    showGameMessage(`¡${player.name} gana $${effect.value} USD de ${effect.target}!`, 'success');
                } else {
                    showGameMessage(`¡${player.name} gana +${effect.value} ${effect.target} al instante!`, 'success');
                }
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
        // Solo el jugador humano debería ver este mensaje
        if (playerKey === 'player1') {
            showGameMessage("No tienes suficientes recursos para jugar esta carta.", 'error');
        }
        return false; // Retorna false para indicar que no se jugó la carta
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
    return true; // Retorna true para indicar que la carta se jugó con éxito
}

// --- LÓGICA DE INTELIGENCIA ARTIFICIAL (AI) ---

/**
 * Lógica de decisión del oponente (Diseñador Beta).
 * Intenta jugar hasta 3 cartas por turno.
 */
function aiTurn() {
    const aiKey = 'player2';
    const aiPlayer = GAME_STATE[aiKey];
    const definitions = GAME_STATE.cardDefinitions;
    let cardsPlayedCount = 0;
    const maxCardsToPlay = 3;

    showGameMessage(`${aiPlayer.name} (Beta) está diseñando...`, 'info');

    const tryPlayCard = (cardKey) => {
        // Ejecuta la lógica central de playCard
        const played = playCard(cardKey);
        if (played) {
            cardsPlayedCount++;
            return true;
        }
        return false;
    };

    // La IA intentará jugar cartas hasta 3 veces o hasta que no pueda pagar.
    while (cardsPlayedCount < maxCardsToPlay && aiPlayer.hand.length > 0) {
        
        // 1. Identificar objetivos faltantes y la distancia
        const missingScores = {};
        const scores = aiPlayer.scores;
        const thresholds = GAME_STATE.game.victoryThresholds;
        let isMissingAnyScore = false;

        for (const target in thresholds) {
            const needed = thresholds[target] - scores[target];
            if (needed > 0) {
                missingScores[target] = needed;
                isMissingAnyScore = true;
            }
        }
        
        // Si ya ganó, sal del bucle
        if (!isMissingAnyScore) break; 

        // 2. Estrategia de Priorización
        let bestCardKey = null;

        // Recorre la mano para encontrar la mejor carta que la IA pueda pagar.
        for (const cardKey of aiPlayer.hand) {
            const cardDef = definitions[cardKey];
            let canAfford = true;
            
            // Chequear si puede pagar
            for (const [res, cost] of Object.entries(cardDef.cost)) {
                if (aiPlayer.resources[res] < cost) {
                    canAfford = false;
                    break;
                }
            }
            
            if (!canAfford) continue;

            // Prioridad 1.1: ¿Esta carta suma directamente a un objetivo faltante?
            if (cardDef.effect.type === 'score' && missingScores[cardDef.effect.target]) {
                bestCardKey = cardKey;
                break; // Jugar inmediatamente la primera carta útil encontrada
            } 
            
            // Prioridad 1.2: ¿Es una carta múltiple que ayuda a un objetivo faltante?
            if (cardDef.effect.type === 'multiple' && cardDef.effect.effects.some(e => e.type === 'score' && missingScores[e.target])) {
                 bestCardKey = cardKey;
                 break; // Jugar inmediatamente la primera carta útil encontrada
            }
            
            // Prioridad 1.3: ¿Es una carta de recurso que puede desbloquear jugadas futuras?
            if (!bestCardKey) {
                // Si la IA tiene poco presupuesto (< 500) y puede facturar, prioriza.
                if (cardKey === 'Facturacion_Express' && aiPlayer.resources.presupuesto < 500) {
                    bestCardKey = cardKey;
                }
                // Si tiene baja inspiración (< 5) y puede investigar para regeneración, prioriza.
                if (cardKey === 'Investigacion_UX' && aiPlayer.resources.inspiracion < 5) {
                    bestCardKey = cardKey;
                }
            }
        }

        // 3. Jugar la carta elegida o terminar el turno de la IA
        if (bestCardKey) {
            tryPlayCard(bestCardKey);
        } else {
            // Si no se encontró ninguna carta útil o que pudiera pagar, termina el bucle.
            break;
        }

        // Comprobación de victoria después de cada carta jugada
        if (gameIsOver) return;
    }

    // Mensaje de fin de turno de la IA
    showGameMessage(`${aiPlayer.name} (Beta) ha terminado su turno.`, 'info');
    
    // El turno oficial finalizará en endTurn, que llama a aiTurn, y luego avanza el turno.
}

function endTurn() {
    if (gameIsOver) return;

    // Deshabilitar el botón para evitar doble click
    document.getElementById('btnEndTurn').disabled = true;

    const currentPlayerKey = GAME_STATE.game.currentPlayer;
    const nextPlayerKey = currentPlayerKey === 'player1' ? 'player2' : 'player1';
    
    // --- FASE 1: Chequeo de fin de partida por turnos ---
    // Si el turno actual es el máximo, terminamos el juego ANTES de empezar el siguiente turno.
    if (GAME_STATE.game.currentTurn >= GAME_STATE.game.maxTurns && currentPlayerKey === 'player2') {
         // Si es el turno 10 y el jugador 2 termina, el juego finaliza.
        handleGameEnd(null); 
        return;
    }
    
    // --- FASE 2: Recarga (Regen del Siguiente Jugador) ---
    const nextPlayer = GAME_STATE[nextPlayerKey];
    const defs = GAME_STATE.game.resourceDefinitions;
    
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

    // Robar 1 carta (SIEMPRE se roba al inicio del turno del siguiente jugador)
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
        }
    }
    
    // --- FASE 3: Cambio de Turno ---
    GAME_STATE.game.currentPlayer = nextPlayerKey;
    if (nextPlayerKey === 'player1') {
        GAME_STATE.game.currentTurn++;
    }

    showGameMessage(`Turno ${GAME_STATE.game.currentTurn}: ¡Es el turno de ${nextPlayer.name}!`, 'yellow');

    // --- FASE 4: Ejecución de Turno de la IA (si aplica) ---
    if (nextPlayerKey === 'player2' && !gameIsOver) {
        // Delay para simular que la IA "piensa"
        setTimeout(() => {
            aiTurn(); // Ejecuta la lógica de la IA
            // Luego, la IA inmediatamente finaliza su turno para que regrese al jugador 1
            // Usamos un doble setTimeout para simular la espera
            if (!gameIsOver) {
                 setTimeout(() => {
                    // LLamada recursiva a endTurn, que ahora procesará el cambio a player1
                    endTurn(); 
                }, 1000); 
            }
        }, 1000); 
    } else {
        // --- FASE 5: Actualizar UI y Habilitar Botón (Solo para el jugador humano) ---
        updateUI();
        document.getElementById('btnEndTurn').disabled = false;
    }
}

// --- LÓGICA DE EVENTOS E INICIO ---

document.addEventListener('DOMContentLoaded', () => {
    // Función para reiniciar el estado del juego
    const resetGame = () => {
        // Clonación profunda del estado inicial
        if (typeof INITIAL_GAME_STATE === 'undefined') {
            console.error("Error crítico: INITIAL_GAME_STATE no está definido. Asegura la carga de game_state.js");
            return;
        }
        
        GAME_STATE = JSON.parse(JSON.stringify(INITIAL_GAME_STATE)); 
        gameIsOver = false;
        document.getElementById('btnEndTurn').disabled = false;
        hideGameOverModal(); // Asegura que el modal esté oculto al iniciar
        
        // Barajar el mazo de cada jugador al inicio de la partida
        const shuffleDeck = (playerKey) => {
            const player = GAME_STATE[playerKey];
            player.deck.sort(() => Math.random() - 0.5);
        };
        shuffleDeck('player1');
        shuffleDeck('player2');
        
        // Robar 5 cartas iniciales a cada jugador
        for (let i = 0; i < 5; i++) {
             let cardP1 = GAME_STATE.player1.deck.pop();
             if (cardP1) GAME_STATE.player1.hand.push(cardP1);
             
             let cardP2 = GAME_STATE.player2.deck.pop();
             if (cardP2) GAME_STATE.player2.hand.push(cardP2);
        }
    }

    // Inicializa el estado para que la colección funcione antes de iniciar partida
    if (typeof INITIAL_GAME_STATE !== 'undefined') {
        GAME_STATE = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
    }


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

    // --- NUEVOS LISTENERS PARA EL MODAL DE FIN DE PARTIDA ---
    document.getElementById('btnModalRestart').addEventListener('click', () => {
        hideGameOverModal();
        resetGame(); // Reinicia el estado del juego
        switchView('game-screen'); // Vuelve a la pantalla de juego
        updateUI(); 
        showGameMessage("¡Partida Reiniciada! Un nuevo Brief ha llegado.");
    });

    document.getElementById('btnModalMenu').addEventListener('click', () => {
        hideGameOverModal();
        switchView('menu-screen'); // Vuelve al menú principal
    });
});
