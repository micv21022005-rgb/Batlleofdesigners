/**
 * game_state.js
 * Define el estado inicial del juego, las definiciones de recursos,
 * y todas las cartas disponibles (18 en total).
 */

const GAME_CARD_DEFINITIONS = {
    // --- CARTAS INICIALES (8) ---
    Ajuste_Kerning: {
        name: "Ajuste de Kerning",
        description: "Optimiza el espaciado entre caracteres para mejorar la legibilidad del título.",
        cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
        effect: { type: "score", target: "impactoVisual", value: 1 }
    },
    Refactor_CSS: {
        name: "Refactorización de CSS",
        description: "Limpia y organiza los estilos. Reduce el tiempo de carga ligeramente.",
        cost: { tiempo: 0, inspiracion: 1, presupuesto: 0 },
        effect: { type: "resource_gain", target: "tiempo", value: 1 }
    },
    Pruebas_Usabilidad: {
        name: "Pruebas de Usabilidad (A/B)",
        description: "Identifica un punto de fricción crítico en la navegación.",
        cost: { tiempo: 2, inspiracion: 1, presupuesto: 0 },
        effect: { type: "score", target: "usabilidadUX", value: 3 }
    },
    Alineacion_Grid: {
        name: "Alineación al Grid",
        description: "Asegura que todos los elementos sigan una estructura modular sólida.",
        cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
        effect: { type: "score", target: "impactoVisual", value: 2 }
    },
    Investigacion_UX: {
        name: "Investigación de Usuario",
        description: "Dedica un día a entender las necesidades del target. Gana inspiración para el próximo turno.",
        cost: { tiempo: 2, inspiracion: 0, presupuesto: 0 },
        effect: { type: "resource_gain", target: "inspiracion", value: 2 }
    },
    Optimizacion_Imagenes: {
        name: "Optimización de Imágenes",
        description: "Comprime y ajusta los formatos de imagen. Mejora la velocidad de carga y usabilidad.",
        cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
        effect: { type: "score", target: "usabilidadUX", value: 1 }
    },
    Tono_Marca: {
        name: "Definición del Tono",
        description: "Alinea la voz del contenido con los valores de la marca.",
        cost: { tiempo: 1, inspiracion: 1, presupuesto: 0 },
        effect: { type: "score", target: "cohesionMarca", value: 2 }
    },
    Facturacion_Express: {
        name: "Facturación Express",
        description: "Envía una factura parcial al cliente. Gana presupuesto inmediatamente.",
        cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
        effect: { type: "resource_immediate", target: "presupuesto", value: 300 }
    },

    // --- NUEVAS CARTAS (10) ---
    Tipografia_Audaz: {
        name: "Tipografía Audaz",
        description: "Implementa una fuente de alto contraste y llamativa. Gran impacto visual, pero consume mucho tiempo.",
        cost: { tiempo: 3, inspiracion: 1, presupuesto: 0 },
        effect: { type: "score", target: "impactoVisual", value: 5 }
    },
    Revision_Accesibilidad: {
        name: "Revisión de WCAG",
        description: "Asegura el cumplimiento de las normas de accesibilidad. Mejora la usabilidad y la percepción de marca.",
        cost: { tiempo: 2, inspiracion: 2, presupuesto: 0 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "usabilidadUX", value: 3 },
            { type: "score", target: "cohesionMarca", value: 1 }
        ]}
    },
    Paleta_Vibrante: {
        name: "Paleta de Colores Vibrante",
        description: "Selecciona una paleta energética. Impulsa el impacto visual.",
        cost: { tiempo: 1, inspiracion: 1, presupuesto: 0 },
        effect: { type: "score", target: "impactoVisual", value: 3 }
    },
    Mapa_Sitio: {
        name: "Mapa del Sitio Detallado",
        description: "Planifica la estructura completa del proyecto. Gana tiempo extra para el próximo turno.",
        cost: { tiempo: 2, inspiracion: 0, presupuesto: 0 },
        effect: { type: "resource_gain", target: "tiempo", value: 2 }
    },
    Storytelling_Marca: {
        name: "Storytelling de Marca",
        description: "Teje una narrativa emocional que conecta al usuario con el producto. Refuerza la cohesión de marca.",
        cost: { tiempo: 2, inspiracion: 2, presupuesto: 0 },
        effect: { type: "score", target: "cohesionMarca", value: 4 }
    },
    Mockup_3D: {
        name: "Mockup 3D Premium",
        description: "Renderiza el diseño en un entorno 3D, elevando la percepción visual. Requiere presupuesto extra.",
        cost: { tiempo: 0, inspiracion: 1, presupuesto: 400 },
        effect: { type: "score", target: "impactoVisual", value: 4 }
    },
    Integracion_API: {
        name: "Integración de API",
        description: "Conecta fuentes de datos externas. Aumenta la complejidad, pero mejora la usabilidad.",
        cost: { tiempo: 3, inspiracion: 0, presupuesto: 200 },
        effect: { type: "score", target: "usabilidadUX", value: 4 }
    },
    Workshop_Creativo: {
        name: "Workshop Creativo",
        description: "Sesión intensa de lluvia de ideas. Gana una carta nueva y recupera inspiración.",
        cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
        effect: { type: "multiple", effects: [
            { type: "draw" },
            { type: "resource_immediate", target: "inspiracion", value: 1 }
        ]}
    },
    Sistema_Diseno: {
        name: "Sistema de Diseño Básico",
        description: "Establece reglas fundamentales de UI. Beneficia la cohesión y la eficiencia futura.",
        cost: { tiempo: 3, inspiracion: 2, presupuesto: 0 },
        effect: { type: "multiple", effects: [
            { type: "score", target: "cohesionMarca", value: 3 },
            { type: "resource_gain", target: "tiempo", value: 1 }
        ]}
    },
    Contrato_Retainer: {
        name: "Contrato Retainer",
        description: "Asegura trabajo futuro y estabilidad financiera. Gran ganancia de presupuesto inmediata.",
        cost: { tiempo: 0, inspiracion: 0, presupuesto: 0 },
        effect: { type: "resource_immediate", target: "presupuesto", value: 600 }
    }
};

// Crea un mazo de 20 cartas para cada jugador (las 18 únicas, más 2 extras comunes)
const ALL_CARD_KEYS = Object.keys(GAME_CARD_DEFINITIONS);
const BASE_DECK = [...ALL_CARD_KEYS, 'Ajuste_Kerning', 'Refactor_CSS']; // 20 cartas

const INITIAL_GAME_STATE = {
    cardDefinitions: GAME_CARD_DEFINITIONS,
    
    game: {
        currentPlayer: 'player1', // El jugador 1 siempre comienza
        currentTurn: 1,
        maxTurns: 10, // Límite de turnos para el juego
        victoryThresholds: {
            impactoVisual: 12,
            usabilidadUX: 12,
            cohesionMarca: 12
        },
        resourceDefinitions: {
            tiempo: { max: 5, regen: 2 },        // Tiempo (T)
            inspiracion: { max: 5, regen: 1 },   // Inspiración (I)
            presupuesto: { max: 9999, regen: 0 } // Presupuesto (P) - no se regenera
        }
    },

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
            presupuesto: 500
        },
        extraRegen: { // Recursos extra ganados que se aplican el próximo turno
            tiempo: 0,
            inspiracion: 0,
            presupuesto: 0
        },
        deck: [...BASE_DECK], // Copia inicial del mazo
        hand: [], // Cartas iniciales se reparten al iniciar
        discard: []
    },

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
            presupuesto: 500
        },
        extraRegen: {
            tiempo: 0,
            inspiracion: 0,
            presupuesto: 0
        },
        deck: [...BASE_DECK], 
        hand: [], 
        discard: []
    }
};
