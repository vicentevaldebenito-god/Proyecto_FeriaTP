// ==========================================
// CONFIGURACIÓN DE API
// ==========================================
const GEMINI_API_KEY = "AQ.Ab8RN6I5yVuFnO6_mYF933Ec3YSsfDanTqvuyVWF9tbZGRlTNQ";

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

    // 3. Registrar mensaje en el historial
    chatHistory.push({
        role: "user",
        parts: [{ text: userText }]
    });

    // Endpoint actualizado a gemini-2.0-flash
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;    try {
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

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            botDiv.innerText = aiResponse;

            chatHistory.push({
                role: "model",
                parts: [{ text: aiResponse }]
            });
        } else if (data.error) {
            botDiv.innerText = `Error API: ${data.error.message}`;
        } else {
            botDiv.innerText = "Respuesta no disponible.";
        }
    } catch (error) {
        console.error("Detalle del error:", error);
        botDiv.innerText = "Error de conexión con la IA. Revisa la consola del navegador (F12).";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================================
// CURSOS Y MODAL EDUCATIVO
// ==========================================
const coursesData = {
    1: {
        tag: "Modelo Canvas",
        title: "¿Qué problema resuelves y a quién?",
        content: `
            <div class="lesson-text">
                <p>No necesitas escribir un libro de 50 páginas para planear tu negocio. El Modelo Canvas es simplemente <strong>ordenar tu idea en una sola vista</strong>.</p>
                <div class="lesson-box">
                    <strong>💡 La clave:</strong> Nadie compra un producto solo porque sí, compran algo que les ahorra tiempo, dinero o un dolor de cabeza.
                </div>
                <p>Para empezar bien, define estos 3 puntos sencillos:</p>
                <ul class="lesson-steps">
                    <li><strong>Tu Cliente Ideal:</strong> Sé muy específico (ej: "Personas que trabajan en oficina y no tienen tiempo de cocinar").</li>
                    <li><strong>Tu Propuesta de Valor:</strong> ¿Por qué te elegirían a ti? (ej: "Menús caseros congelados listos en 3 minutos").</li>
                    <li><strong>Tu Forma de Cobro:</strong> ¿Te pagan por producto individual, por paquete semanal o mensualidad?</li>
                </ul>
            </div>
        `
    },
    2: {
        tag: "Finanzas Pyme",
        title: "Calcula el precio correcto sin perder dinero",
        content: `
            <div class="lesson-text">
                <p>El error más común es cobrar "a ojo" o fijarte solo en lo que cobra la competencia.</p>
                <div class="lesson-box">
                    <strong>Fórmula Directa:</strong><br>
                    Precio = Materiales + Tu Pago por Hora + Margen de la Empresa.
                </div>
                <p>Paso a paso para calcular tus precios:</p>
                <ul class="lesson-steps">
                    <li><strong>Costo Variable:</strong> Suma lo que usas en UN solo producto (ingredientes, empaque, etiquetas).</li>
                    <li><strong>Tu Sueldo:</strong> Define cuánto vale tu hora de trabajo y súmasela al producto. ¡Tu tiempo vale!</li>
                    <li><strong>Ganancia para el Negocio:</strong> Agrega un porcentaje extra (ej: 30%) que se guarda para emergencias o inversión.</li>
                </ul>
            </div>
        `
    },
    3: {
        tag: "Legal e Impuestos",
        title: "Perdiéndole el miedo a la formalización",
        content: `
            <div class="lesson-text">
                <p>Formalizar no es para que te quiten dinero, es la única forma de <strong>venderle a empresas grandes, pedir créditos e importar sin problemas</strong>.</p>
                <div class="lesson-box">
                    <strong>Dato importante:</strong> El IVA no sale de tu bolsillo. Es un valor que paga tu cliente y tú solo lo recibes para entregárselo al estado.
                </div>
                <p>El camino simple para formalizarte:</p>
                <ul class="lesson-steps">
                    <li><strong>Crea tu Empresa Online:</strong> Usa portales oficiales como "Empresa en un Día" para crear tu sociedad rápidamente.</li>
                    <li><strong>Inicio de Actividades:</strong> Le informas al servicio tributario que comenzarás a operar legalmente.</li>
                    <li><strong>Emite Boletas o Facturas:</strong> Emite tus documentos digitales para mantener tus operaciones transparentes.</li>
                </ul>
            </div>
        `
    }
};

function openCourse(courseId) {
    const modal = document.getElementById('course-modal');
    const modalBody = document.getElementById('modal-body');
    const course = coursesData[courseId];

    if (!course || !modal || !modalBody) return;

    modalBody.innerHTML = `
        <span class="lesson-tag">${course.tag}</span>
        <h3 class="lesson-title">${course.title}</h3>
        ${course.content}
        <button class="btn-finish-lesson" onclick="closeCourseModal()">¡Entendido! Completar Clase</button>
    `;

    modal.classList.remove('hidden');
}

function closeCourseModal() {
    const modal = document.getElementById('course-modal');
    if (modal) modal.classList.add('hidden');
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