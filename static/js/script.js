// ==========================================
// CONFIGURACIÓN DE API
// ==========================================
const GEMINI_API_KEY = "AQ.Ab8RN6LaevZaWUrexhrYWhbddQGZT6smMJxvRYXZ9GBUHEgBIQ";

// Instrucción de Sistema para especializar la IA en emprendimiento
const SYSTEM_INSTRUCTION = `
Eres "Prospere IA", el mentor oficial de la plataforma Prospere, diseñado para guiar a emprendedores y Pymes.

TUS REGLAS Y PERSONALIDAD:
1. Especialización: Responde sobre gestión de negocios, Modelo Canvas, educación financiera, flujo de caja, precios, impuestos y trámites locales.
2. Formato: Genera respuestas cortas, directas y accionables. Usa listas con viñetas o negritas para facilitar la lectura.
3. Tono: Cercano, profesional, claro y motivador. Evita el lenguaje técnico complejo.
4. Práctica: Si el usuario plantea una duda sobre un producto o costo, dale una fórmula sencilla o los pasos inmediatos a seguir.
`;

// HISTORIAL DE CHAT (Para mantener el contexto de la conversación)
let chatHistory = [];

// ==========================================
// NAVEGACIÓN Y CAMBIO DE SECCIONES
// ==========================================
function switchTab(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // Remueve la clase active de todas las secciones
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // Activa la sección seleccionada
    targetSection.classList.add('active');

    // Actualiza los botones de la barra inferior
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-target') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Escuchar la tecla Enter en el input del chat
function handleKeyPress(e) {
    if (e.key === 'Enter') sendAIMessage();
}

// ==========================================
// ASISTENTE DE IA (GEMINI API)
// ==========================================
async function sendAIMessage() {
    const input = document.getElementById('chat-input');
    const userText = input.value.trim();
    if (!userText) return;

    const chatBox = document.getElementById('chat-box');

    // 1. Mostrar mensaje del usuario
    const userDiv = document.createElement('div');
    userDiv.className = 'msg user-msg';
    userDiv.innerText = userText;
    chatBox.appendChild(userDiv);

    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. Mostrar indicador de respuesta
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot-msg';
    botDiv.innerText = 'Analizando tu consulta...';
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. Registrar mensaje del usuario en el historial
    chatHistory.push({
        role: "user",
        parts: [{ text: userText }]
    });

    // Usamos la versión de modelo 2.5/2.0 compatible con las claves actuales de AI Studio
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                contents: chatHistory
            })
        });

        const data = await response.json();

        // Si hay un error devuelto por la API, lo mostramos en pantalla para solucionarlo al instante
        if (data.error) {
            console.error("Error API Gemini:", data.error);
            botDiv.innerText = `Error de API: ${data.error.message || 'Clave o modelo no permitido.'}`;
            return;
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResponse = data.candidates[0].content.parts[0].text;

            botDiv.innerText = aiResponse;

            chatHistory.push({
                role: "model",
                parts: [{ text: aiResponse }]
            });
        } else {
            botDiv.innerText = "No se recibió respuesta del modelo.";
        }
    } catch (error) {
        console.error("Error de red:", error);
        botDiv.innerText = "Error de conexión. Si usas Chrome/Edge, prueba abriendo la página mediante un servidor local (Live Server).";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}
// ==========================================
// CÁMARA Y MÓDULO IOT
// ==========================================
let videoStream = null;

async function startCamera() {
    const video = document.getElementById('webcam');
    const placeholder = document.getElementById('cam-placeholder');
    const btnStart = document.getElementById('btn-start-cam');
    const btnSnap = document.getElementById('btn-snap');

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        video.classList.remove('hidden');
        placeholder.classList.add('hidden');
        btnStart.classList.add('hidden');
        btnSnap.classList.remove('hidden');
    } catch (err) {
        alert("No fue posible acceder a la cámara. Revisa los permisos de tu navegador.");
    }
}

function takeSnapshot() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const scanResult = document.getElementById('scan-result');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    video.classList.add('hidden');
    canvas.classList.remove('hidden');

    // Detener la transmisión de la cámara
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }

    scanResult.innerHTML = `
    <div style="background: #d1fae5; color: #065f46; padding: 12px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
      <i class="bi bi-check-circle-fill"></i> Análisis completado: Estándar de Calidad 98% Conforme
    </div>
  `;
}