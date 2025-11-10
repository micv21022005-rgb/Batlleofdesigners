/**
 * Definiciones de las cartas.
 * Formato: { [CardKey]: { name, description, cost: {resource: value}, effect: {type, target, value} } }
 */
const CARD_DEFINITIONS = {
    // --- Cartas de Impacto Visual (Rojo/Rosa) ---
    Tipografia_Audaz: {
        name: "Tipografía Audaz",
        description: "Impacto inmediato en la estética visual. Alto riesgo, alta recompensa.",
        cost: { tiempo: 2, inspiracion: 1 },
        effect: { type: "score", target: "impactoVisual", value: 3 },
        color: "#ff6584"
    },
    Paleta_Premium: {
        name: "Paleta Premium",
        description: "Añade riqueza visual, pero consume recursos rápidamente.",
        cost: { tiempo: 3, inspiracion: 2 },
        effect: { type: "score", target: "impactoVisual", value: 5 },
        color: "#ff6584"
    },
    Minimalismo_Elegante: {
        name: "Minimalismo Elegante",
        description: "Maximiza el impacto con menos elementos. Gana tiempo.",
        cost: { inspiracion: 2 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "impactoVisual", value: 2 },
            { type: "resource_immediate", target: "tiempo", value: 1 }
        ]},
        color: "#ff6584"
    },
    Animacion_Fina: {
        name: "Animación Fina",
        description: "Mejora el impacto y roba una carta para mantener el flujo.",
        cost: { tiempo: 2, presupuesto: 200 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "impactoVisual", value: 2 },
            { type: "draw", target: null, value: 1 }
        ]},
        color: "#ff6584"
    },
    // --- Cartas de Usabilidad/UX (Verde) ---
    Investigacion_UX: {
        name: "Investigación UX",
        description: "Descubre mejores prácticas, ganando Inspiración para el próximo turno.",
        cost: { tiempo: 1 },
        effect: { type: "resource_gain", target: "inspiracion", value: 2 },
        color: "#8dff8d"
    },
    Test_Usuarios: {
        name: "Test de Usuarios",
        description: "Ajusta la usabilidad en función de datos reales.",
        cost: { tiempo: 3 },
        effect: { type: "score", target: "usabilidadUX", value: 4 },
        color: "#8dff8d"
    },
    Flujo_Optimizado: {
        name: "Flujo Optimizado",
        description: "Simplifica la navegación, mejorando la UX a bajo costo.",
        cost: { inspiracion: 1 },
        effect: { type: "score", target: "usabilidadUX", value: 2 },
        color: "#8dff8d"
    },
    Accesibilidad_Avanzada: {
        name: "Accesibilidad Avanzada",
        description: "Asegura la usabilidad para todos y roba una carta.",
        cost: { tiempo: 2, inspiracion: 1 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "usabilidadUX", value: 3 },
            { type: "draw", target: null, value: 1 }
        ]},
        color: "#8dff8d"
    },
    // --- Cartas de Cohesión de Marca (Azul) ---
    Guia_Estilo: {
        name: "Guía de Estilo",
        description: "Establece la coherencia. Gana un poco de cada puntuación.",
        cost: { tiempo: 3 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "cohesionMarca", value: 2 },
            { type: "score", target: "impactoVisual", value: 1 },
            { type: "score", target: "usabilidadUX", value: 1 }
        ]},
        color: "#8d8dff"
    },
    Tono_Voz: {
        name: "Tono de Voz",
        description: "Define el carácter de la marca. Gana tiempo para implementarlo.",
        cost: { inspiracion: 1 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "cohesionMarca", value: 2 },
            { type: "resource_immediate", target: "tiempo", value: 1 }
        ]},
        color: "#8d8dff"
    },
    Integracion_Logotipo: {
        name: "Integración Logotipo",
        description: "Asegura que el logo esté presente y cohesionado en todos los puntos.",
        cost: { tiempo: 1, inspiracion: 1 },
        effect: { type: "score", target: "cohesionMarca", value: 3 },
        color: "#8d8dff"
    },
    Arquitectura_Solida: {
        name: "Arquitectura Sólida",
        description: "Un backend bien pensado que refuerza la marca. Alto costo.",
        cost: { tiempo: 4, presupuesto: 300 },
        effect: { type: "score", target: "cohesionMarca", value: 6 },
        color: "#8d8dff"
    },
    // --- Cartas de Recurso/Utility (Amarillo) ---
    Facturacion_Express: {
        name: "Facturación Express",
        description: "Cobra un anticipo inesperado, ganando presupuesto instantáneo.",
        cost: { tiempo: 1 },
        effect: { type: "resource_immediate", target: "presupuesto", value: 400 },
        color: "#f5f58c"
    },
    Cafe_Doble: {
        name: "Café Doble",
        description: "Un impulso de cafeína para ganar Tiempo de diseño.",
        cost: { presupuesto: 100 },
        effect: { type: "resource_immediate", target: "tiempo", value: 2 },
        color: "#f5f58c"
    },
    Brainstorming_Intenso: {
        name: "Brainstorming Intenso",
        description: "Genera ideas, recuperando inspiración.",
        cost: { tiempo: 1 },
        effect: { type: "resource_immediate", target: "inspiracion", value: 2 },
        color: "#f5f58c"
    },
    Pivote_Agil: {
        name: "Pivote Ágil",
        description: "Cambia rápidamente la dirección del proyecto. Te hace robar 2 cartas.",
        cost: { inspiracion: 1 },
        effect: { type: "multiple", effects: [
            { type: "draw", target: null, value: 1 },
            { type: "draw", target: null, value: 1 }
        ]},
        color: "#f5f58c"
    },
    
    // --- Cartas de Alto Impacto (Especiales) ---
    Lanzamiento_Beta: {
        name: "Lanzamiento Beta",
        description: "Un lanzamiento provisional que da impacto y cohesión.",
        cost: { tiempo: 4, inspiracion: 2 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "impactoVisual", value: 3 },
            { type: "score", target: "cohesionMarca", value: 3 }
        ]},
        color: "#ff6584"
    },
    Framework_Eficiente: {
        name: "Framework Eficiente",
        description: "Una base de código excelente para alta usabilidad y ahorro.",
        cost: { presupuesto: 400, tiempo: 1 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "usabilidadUX", value: 4 },
            { type: "resource_immediate", target: "presupuesto", value: 100 }
        ]},
        color: "#8dff8d"
    }
};

/**
 * Define el estado inicial del juego.
 * Mazo balanceado y recursos iniciales.
 */
const INITIAL_GAME_STATE = {
    // Definiciones estáticas (las cartas)
    cardDefinitions: CARD_DEFINITIONS,

    // Definiciones del juego
    game: {
        currentTurn: 1,
        maxTurns: 10, // Límite de turnos para terminar la partida
        currentPlayer: 'player1', // 'player1' (humano) o 'player2' (IA)
        victoryThresholds: {
            impactoVisual: 12,
            usabilidadUX: 12,
            cohesionMarca: 12
        },
        resourceDefinitions: {
            tiempo: { max: 5, regen: 3, unit: '⏱️' },
            inspiracion: { max: 5, regen: 2, unit: '✨' },
            presupuesto: { max: Infinity, regen: 0, unit: '$' }
        }
    },

    // Estado del Jugador Humano
    player1: {
        name: "Diseñador Humano",
        scores: {
            impactoVisual: 0,
            usabilidadUX: 0,
            cohesionMarca: 0
        },
        resources: {
            tiempo: 5,
            inspiracion: 5,
            presupuesto: 1000 // Presupuesto inicial
        },
        extraRegen: { // Recursos extra ganados que se aplicarán el próximo turno
            tiempo: 0,
            inspiracion: 0
        },
        // Mazo inicial: balanceado entre los 3 tipos principales y utilidad
        deck: [
            'Tipografia_Audaz', 'Minimalismo_Elegante', 'Paleta_Premium', 
            'Investigacion_UX', 'Flujo_Optimizado', 'Test_Usuarios', 
            'Guia_Estilo', 'Tono_Voz', 'Integracion_Logotipo', 
            'Facturacion_Express', 'Cafe_Doble', 'Brainstorming_Intenso',
            'Animacion_Fina', 'Accesibilidad_Avanzada', 'Pivote_Agil',
            'Lanzamiento_Beta', 'Framework_Eficiente', 'Arquitectura_Solida'
        ],
        hand: [], // Se llenará con 5 cartas al inicio del juego
        discard: []
    },

    // Estado del Jugador IA (Oponente)
    player2: {
        name: "Diseñador Beta",
        scores: {
            impactoVisual: 0,
            usabilidadUX: 0,
            cohesionMarca: 0
        },
        resources: {
            tiempo: 5,
            inspiracion: 5,
            presupuesto: 1000
        },
        extraRegen: {
            tiempo: 0,
            inspiracion: 0
        },
        // El mazo de la IA es idéntico para un juego justo
        deck: [
            'Tipografia_Audaz', 'Minimalismo_Elegante', 'Paleta_Premium', 
            'Investigacion_UX', 'Flujo_Optimizado', 'Test_Usuarios', 
            'Guia_Estilo', 'Tono_Voz', 'Integracion_Logotipo', 
            'Facturacion_Express', 'Cafe_Doble', 'Brainstorming_Intenso',
            'Animacion_Fina', 'Accesibilidad_Avanzada', 'Pivote_Agil',
            'Lanzamiento_Beta', 'Framework_Eficiente', 'Arquitectura_Solida'
        ],
        hand: [], // Se llenará con 5 cartas al inicio del juego
        discard: []
    }
};
