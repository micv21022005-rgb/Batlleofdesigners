/**
 * game_state.js
 * Objeto central que almacena el estado completo de una partida de "Battle of Designers".
 * Este objeto es la fuente de verdad y se copia al iniciar una partida.
 */

const INITIAL_GAME_STATE = {
    // --- ESTADO GLOBAL DEL JUEGO ---
    game: {
        currentTurn: 1, 
        currentPlayer: 'player1', 
        victoryThresholds: {
            impactoVisual: 10,   // PB requeridos
            usabilidadUX: 8,     // PB requeridos
            cohesionMarca: 5     // PB requeridos
        },
        // Definiciones de recursos para regeneración y límites
        resourceDefinitions: {
            tiempo: { max: 5, regen: 5 },
            inspiracion: { max: 10, regen: 3 },
            presupuesto: { max: Infinity, regen: 0 }
        }
    },

    // --- DEFINICIÓN DE CARTAS ---
    cardDefinitions: {
        "Ajuste_Kerning": {
            name: "Ajuste de Kerning",
            cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
            effect: { type: "score", target: "impactoVisual", value: 2 },
            description: "Mejora rápidamente la legibilidad del texto (+2 PB Impacto)."
        },
        "Moodboard_Creativo": {
            name: "Moodboard Creativo",
            cost: { tiempo: 0, inspiracion: 3, presupuesto: 0 },
            effect: { type: "multiple", effects: [
                { type: "score", target: "usabilidadUX", value: 3 }, 
                { type: "draw", value: 1 }
            ] },
            description: "Gana 3 PB en UX y roba 1 carta."
        },
        "Compra_Licencia": {
            name: "Compra de Licencia",
            cost: { tiempo: 0, inspiracion: 0, presupuesto: 500 },
            effect: { type: "score", target: "cohesionMarca", value: 2 },
            description: "Asegura la identidad con activos profesionales (+2 PB Cohesión)."
        },
        "Investigacion_UX": {
            name: "Investigación UX",
            cost: { tiempo: 3, inspiracion: 1, presupuesto: 0 },
            effect: { type: "resource_gain", target: "inspiracion", value: 2 },
            description: "Consume tiempo para obtener +2 Inspiración extra en el próximo turno."
        }
    },
    
    // --- ESTADO DEL JUGADOR 1 (Local) ---
    player1: {
        name: "Diseñador Alpha",
        resources: {
            tiempo: 5,
            inspiracion: 10,
            presupuesto: 1000
        },
        scores: {
            impactoVisual: 0,
            usabilidadUX: 0,
            cohesionMarca: 0
        },
        deck: [ "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard_Creativo", "Investigacion_UX" ],
        hand: [ "Compra_Licencia", "Ajuste_Kerning" ], 
        discard: [],
        extraRegen: { tiempo: 0, inspiracion: 0, presupuesto: 0 }
    },

    // --- ESTADO DEL JUGADOR 2 (Oponente) ---
    player2: {
        name: "Diseñador Beta",
        resources: {
            tiempo: 5,
            inspiracion: 10,
            presupuesto: 1000
        },
        scores: {
            impactoVisual: 0,
            usabilidadUX: 0,
            cohesionMarca: 0
        },
        deck: [ "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard_Creativo", "Investigacion_UX" ],
        hand: [ "Compra_Licencia", "Ajuste_Kerning" ],
        discard: [],
        extraRegen: { tiempo: 0, inspiracion: 0, presupuesto: 0 }
    }
};
