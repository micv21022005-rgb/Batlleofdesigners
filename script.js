// Función para mostrar mensajes de juego (reemplaza a alert() y confirm())
function showGameMessage(message) {
    const msgBox = document.getElementById('message-box');
    
    // Si el elemento existe (debería existir en el HTML)
    if (msgBox) {
        msgBox.textContent = message;
        msgBox.classList.remove('hidden');

        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
            msgBox.classList.add('hidden');
        }, 3000);
    } else {
        console.warn("Elemento 'message-box' no encontrado en el DOM.");
    }
}

// --- LÓGICA DE EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    // Escuchar el clic en el botón JUGAR
    document.getElementById('btnPlay').addEventListener('click', () => {
        showGameMessage("¡Iniciando Batalla! Cargando el Brief...");
        // Futura lógica para cargar la pantalla de juego
    });

    // Escuchar el clic en Colección
    document.getElementById('btnCollection').addEventListener('click', () => {
        showGameMessage("Viendo tu portafolio y colección de cartas...");
        // Futura lógica para ir a la vista de colección
    });

    // Escuchar el clic en Tutorial
    document.getElementById('btnTutorial').addEventListener('click', () => {
        showGameMessage("Accediendo al Tutorial: Aprendiendo a Kerning...");
        // Futura lógica para el tutorial
    });

    // Escuchar el clic en Ajustes
    document.getElementById('btnSettings').addEventListener('click', () => {
        showGameMessage("Abriendo Ajustes: ¿Quieres cambiar tu paleta de colores?");
        // Futura lógica para la pantalla de ajustes
    });

    // Escuchar el clic en Créditos
    document.getElementById('btnCredits').addEventListener('click', () => {
        showGameMessage("Diseño inspirado por la comunidad creativa. ¡Gracias!");
        // Futura lógica para los créditos
    });
});
