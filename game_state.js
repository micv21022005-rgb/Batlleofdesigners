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
        maxTurns: 10, // Límite de turnos para terminar la partida (máximo 5 por jugador)
        
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

    // --- DEFINICIÓN DE CARTAS (TOTAL: 18) ---
    cardDefinitions: {
        // --- CARTAS BASE Y FINANCIERAS (8) ---
        "Ajuste_Kerning": {
            name: "Ajuste de Kerning",
            cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
            effect: { type: "score", target: "impactoVisual", value: 2 },
            description: "Mejora rápidamente la legibilidad del texto."
        },
        "Moodboard_Creativo": {
            name: "Moodboard Creativo",
            cost: { tiempo: 0, inspiracion: 3, presupuesto: 0 },
            effect: { type: "multiple", effects: [
                { type: "score", target: "usabilidadUX", value: 3 }, 
                { type: "draw", value: 1 }
            ] },
            description: "Define el tono visual del proyecto."
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
            description: "Consume tiempo para obtener Inspiración extra el próximo turno."
        },
        "Facturacion_Express": {
            name: "Facturación Express",
            cost: { tiempo: 1, inspiracion: 0, presupuesto: 0 },
            effect: { type: "resource_immediate", target: "presupuesto", value: 400 },
            description: "Envías una factura pendiente. Ganas presupuesto al instante."
        },
        "Negociacion_Cliente": {
            name: "Negociación con Cliente",
            cost: { tiempo: 0, inspiracion: 1, presupuesto: 0 },
            effect: { type: "score", target: "cohesionMarca", value: 1, sideEffect: { type: "resource_immediate", target: "presupuesto", value: 200 } },
            description: "Logras un acuerdo que suma PB Cohesión y ganas presupuesto."
        },
        "Prototipo_Premium": {
            name: "Prototipo Premium",
            cost: { tiempo: 2, inspiracion: 0, presupuesto: 700 },
            effect: { type: "multiple", effects: [
                { type: "score", target: "impactoVisual", value: 2 },
                { type: "score", target: "usabilidadUX", value: 2 }
            ] },
            description: "Usas presupuesto para un prototipo avanzado."
        },
        "Optimizar_Activos": {
            name: "Optimizar Activos",
            cost: { tiempo: 1, inspiracion: 1, presupuesto: 0 },
            effect: { type: "resource_immediate", target: "presupuesto", value: 100 },
            description: "Reutilizas activos y ahorras. Ganas presupuesto."
        },

        // --- NUEVAS CARTAS DE DISEÑO AVANZADO (10) ---
        "Diseno_Logotipo": {
            name: "Diseño de Logotipo",
            cost: { tiempo: 3, inspiracion: 2, presupuesto: 0 },
            effect: { type: "score", target: "cohesionMarca", value: 3, sideEffect: { type: "score", target: "impactoVisual", value: 1} },
            description: "Creación de la base de la identidad visual."
        },
        "Manual_Marca": {
            name: "Manual de Marca",
            cost: { tiempo: 1, inspiracion: 0, presupuesto: 600 },
            effect: { type: "score", target: "cohesionMarca", value: 3, sideEffect: { type: "resource_gain", target: "inspiracion", value: 3 } },
            description: "Documentar pautas para la coherencia visual, obtiene Inspiración para el próximo turno."
        },
        "Wireframes_UX": {
            name: "Wireframes (Estructura UX)",
            cost: { tiempo: 1, inspiracion: 1, presupuesto: 0 },
            effect: { type: "score", target: "usabilidadUX", value: 2, sideEffect: { type: "resource_gain", target: "tiempo", value: 2 } },
            description: "Estructura la información para una mejor navegación. Otorga Tiempo extra."
        },
        "Prototipado_Interactivo": {
            name: "Prototipado Interactivo",
            cost: { tiempo: 2, inspiracion: 0, presupuesto: 800 },
            effect: { type: "score", target: "usabilidadUX", value: 4 },
            description: "Pruebas funcionales avanzadas de UI/UX con alto impacto."
        },
        "Calendario_Contenido": {
            name: "Calendario de Contenido",
            cost: { tiempo: 0, inspiracion: 1, presupuesto: 0 },
            effect: { type: "multiple", effects: [
                { type: "draw", value: 1 }, 
                { type: "score", target: "impactoVisual", value: 1 } 
            ]},
            description: "Planificación estratégica de posts para redes sociales y publicidad digital."
        },
        "Maquetacion_Editorial": {
            name: "Maquetación Editorial",
            cost: { tiempo: 4, inspiracion: 0, presupuesto: 0 },
            effect: { type: "score", target: "cohesionMarca", value: 2, sideEffect: { type: "score", target: "impactoVisual", value: 1 } },
            description: "Organización de jerarquías visuales en publicaciones (libros/revistas)."
        },
        "Diseno_Empaque": {
            name: "Diseño de Empaque",
            cost: { tiempo: 2, inspiracion: 2, presupuesto: 500 },
            effect: { type: "score", target: "impactoVisual", value: 3 },
            description: "Diseño que protege y vende el producto (packaging)."
        },
        "Ilustracion_Vectorial": {
            name: "Ilustración Vectorial",
            cost: { tiempo: 2, inspiracion: 2, presupuesto: 0 },
            effect: { type: "multiple", effects: [
                { type: "score", target: "impactoVisual", value: 2 },
                { type: "draw", value: 1 }
            ]},
            description: "Activos visuales únicos y escalables (infografías)."
        },
        "Retoque_Fotografico": {
            name: "Retoque Fotográfico",
            cost: { tiempo: 1, inspiracion: 1, presupuesto: 0 },
            effect: { type: "resource_immediate", target: "presupuesto", value: 300, sideEffect: { type: "score", target: "impactoVisual", value: 1 } },
            description: "Mejora de calidad y composición de imágenes, gana Presupuesto."
        },
        "Presentacion_Visual": {
            name: "Presentación Visual",
            cost: { tiempo: 2, inspiracion: 2, presupuesto: 0 },
            effect: { type: "multiple", effects: [
                { type: "score", target: "usabilidadUX", value: 2 },
                { type: "score", target: "cohesionMarca", value: 1 }
            ]},
            description: "Conceptualización y venta de la idea al cliente (propuestas visuales)."
        }
    },
    
    // --- ESTADO INICIAL DEL JUGADOR 1 (Local) ---
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
        // Mazo completo con 18 cartas (una de cada tipo)
        deck: [ 
            "Ajuste_Kerning", "Ajuste_Kerning", "Moodboard
