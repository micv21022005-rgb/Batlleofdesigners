/**
 * game_state.js
 * * Objeto central que almacena el estado completo de una partida de "Battle of Designers".
 * Este objeto será modificado en cada turno y utilizado para renderizar la interfaz.
 */

const INITIAL_GAME_STATE = {
    // --- ESTADO GLOBAL DEL JUEGO ---
    game: {
        currentTurn: 1, // Contador de turnos.
        currentPlayer: 'player1', // El jugador que tiene el turno ('player1' o 'player2').
        victoryThresholds: {
            impactoVisual: 10,   // PB requeridos para ganar.
            usabilidadUX: 8,     // PB requeridos para ganar.
            cohesionMarca: 5     // PB requeridos para ganar.
        }
    },

    // --- DEFINICIÓN DE CARTAS ---
    // Un diccionario de todas las cartas disponibles en el juego.
    cardDefinitions: {
        // Cartas base que ambos jugadores comienzan teniendo
        "Ajuste_Kerning": {
            name: "Ajuste de Kerning",
            cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
            effect: { type: "score", target: "impactoVisual", value: 2 },
            description: "Mejora rápidamente la legibilidad del texto."
        },
        "Moodboard_Creativo": {
            name: "Moodboard Creativo",
            cost: { tiempo: 0, inspiracion: 3, presupuesto: 0 },
            effect: { type: "draw", value: 1, bonusScore: { usabilidadUX: 3 } },
            description: "Gana 3 PB en UX y roba 1 carta (requiere inspiración)."
        },
        "Compra_Licencia": {
            name: "Compra de Licencia",
            cost: { tiempo: 0, inspiracion: 0, presupuesto: 500 },
            effect: { type: "score", target: "cohesionMarca", value: 2 },
            description: "Asegura la identidad con activos profesionales."
        },
        "Investigacion_UX": {
            name: "Investigación UX",
            cost: { tiempo: 3, inspiracion: 1, presupuesto: 0 },
            effect: { type: "resource_gain", target: "inspiracion", value: 2 },
            description: "Consume tiempo para ganar inspiración extra en el próximo turno."
        }
    },
    
    // --- ESTADO DEL JUGADOR 1 (Local) ---
    player1: {
        name: "Diseñador Alpha",
        // Recursos actuales
        resources: {
            tiempo: 5,        // Max Cap: 5, Regen: 5
            inspiracion: 10,  // Max Cap: 10, Regen: 3
            presupuesto: 1000 // Sin Cap, Sin Regen Base
        },
        // Puntos de Brief (PB) acumulados
        scores: {
            impactoVisual: 0,
            usabilidadUX: 0,
            cohesionMarca: 0
        },
        // Cartas
        deck: [ "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard_Creativo", "Investigacion_UX" ], // Cartas en el mazo
        hand: [ "Compra_Licencia", "Ajuste_Kerning" ], // Cartas en la mano (ejemplo)
        discard: [], // Cartas usadas
    },

    // --- ESTADO DEL JUGADOR 2 (Oponente) ---
    player2: {
        name: "Diseñador Beta",
        // Recursos actuales (inicio simétrico)
        resources: {
            tiempo: 5,
            inspiracion: 10,
            presupuesto: 1000
        },
        // Puntos de Brief (PB) acumulados
        scores: {
            impactoVisual: 0,
            usabilidadUX: 0,
            cohesionMarca: 0
        },
        // Cartas
        deck: [ "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard_Creativo", "Investigacion_UX" ],
        hand: [ "Compra_Licencia", "Ajuste_Kerning" ],
        discard: [],
    }
};

// Se exporta el estado inicial para que pueda ser usado en otros scripts.
// (En un entorno de navegador simple, lo haremos disponible globalmente)
// En el script.js principal, simplemente haremos referencia a INITIAL_GAME_STATE.
