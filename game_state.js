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
        maxTurns: 10, // Nuevo límite de turnos para terminar la partida (máximo 5 por jugador)
        
        // Umbrales de victoria ajustados para un juego más corto
        victoryThresholds: {
            impactoVisual: 5,   // PB requeridos
            usabilidadUX: 4,     // PB requeridos
            cohesionMarca: 3     // PB requeridos
        },
        // Definiciones de recursos para regeneración y límites
        resourceDefinitions: {
            tiempo: { max: 5, regen: 5 },
            inspiracion: { max: 10, regen: 3 },
            presupuesto: { max: Infinity, regen: 0 } // Presupuesto no tiene límite máximo ni regeneración automática
        }
    },

    // --- DEFINICIÓN DE CARTAS ---
    cardDefinitions: {
        // CARTAS ORIGINALES
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
        },

        // --- NUEVAS CARTAS DE PRESUPUESTO Y DINERO ---
        "Facturacion_Express": {
            name: "Facturación Express",
            cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
            effect: { type: "resource_immediate", target: "presupuesto", value: 400 }, // Efecto: ganancia inmediata de presupuesto
            description: "Envías una factura pendiente. Ganas $400 USD de presupuesto al instante."
        },
        "Negociacion_Cliente": {
            name: "Negociación con Cliente",
            cost: { tiempo: 0, inspiracion: 1, presupuesto: 0 },
            effect: { type: "score", target: "cohesionMarca", value: 1, sideEffect: { type: "resource_immediate", target: "presupuesto", value: 200 } },
            description: "Logras un acuerdo que suma 1 PB Cohesión y ganas $200 USD."
        },
        "Prototipo_Premium": {
            name: "Prototipo Premium",
            cost: { tiempo: 2, inspiracion: 0, presupuesto: 700 },
            effect: { type: "multiple", effects: [
                { type: "score", target: "impactoVisual", value: 2 },
                { type: "score", target: "usabilidadUX", value: 2 }
            ] },
            description: "Usas presupuesto para un prototipo avanzado (+2 PB Impacto, +2 PB UX)."
        },
        "Optimizar_Activos": {
            name: "Optimizar Activos",
            cost: { tiempo: 1, inspiracion: 1, presupuesto: 0 },
            effect: { type: "resource_immediate", target: "presupuesto", value: 100 },
            description: "Reutilizas activos y ahorras. Ganas $100 USD."
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
        // Baraja con nuevas cartas
        deck: [ 
            "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard_Creativo", "Investigacion_UX",
            "Facturacion_Express", "Negociacion_Cliente", "Prototipo_Premium", "Optimizar_Activos" 
        ],
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
        // Baraja con nuevas cartas
        deck: [ 
            "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard_Creativo", "Investigacion_UX",
            "Facturacion_Express", "Negociacion_Cliente", "Prototipo_Premium", "Optimizar_Activos" 
        ],
        hand: [ "Compra_Licencia", "Ajuste_Kerning" ],
        discard: [],
        extraRegen: { tiempo: 0, inspiracion: 0, presupuesto: 0 }
    }
};
