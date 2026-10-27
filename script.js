const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.reveal-button').forEach(button => {
  button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const opening = panel.hidden;
    panel.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
    button.innerHTML = opening ? 'Ocultar realidad <span>−</span>' : 'Ver realidad <span>＋</span>';
  });
});

// Localización: solo abre una búsqueda de centros en OpenStreetMap; no almacena coordenadas.
const locateButton = document.getElementById('locateButton');
const locationStatus = document.getElementById('locationStatus');
const mapSearchLink = document.getElementById('mapSearchLink');
locateButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = 'Tu navegador no permite geolocalización. Puedes buscar tu municipio en el mapa.';
    return;
  }
  locateButton.disabled = true;
  locateButton.textContent = 'Buscando ubicación…';
  locationStatus.textContent = 'Si el navegador lo solicita, permite el acceso a tu ubicación.';
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    mapSearchLink.href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;
    locationStatus.textContent = 'Ubicación encontrada. Abre el mapa y busca “centro de salud” para consultar servicios cercanos.';
    locateButton.disabled = false;
    locateButton.textContent = '⌖ Ubicación encontrada';
    window.open(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`, '_blank', 'noopener');
  }, error => {
    const messages = {
      1: 'No se concedió permiso. Puedes usar el mapa y buscar “centro de salud Villa Victoria, Estado de México”.',
      2: 'No se pudo determinar la ubicación. Comprueba la conexión o busca tu municipio en el mapa.',
      3: 'La búsqueda tardó demasiado. Inténtalo de nuevo o usa el mapa manualmente.'
    };
    locationStatus.textContent = messages[error.code] || 'No fue posible obtener la ubicación. Prueba el mapa manualmente.';
    locateButton.disabled = false;
    locateButton.textContent = '⌖ Intentar de nuevo';
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
});

// Asistente educativo básico basado en palabras clave. No es IA ni sustituye a profesionales.
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
function addMessage(text, type) {
  const item = document.createElement('div');
  item.className = `message ${type === 'user' ? 'user-message' : 'bot-message'}`;
  item.textContent = text;
  chatMessages.appendChild(item);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function getReply(question) {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/embaraz|retraso|prueba de embarazo/.test(q)) {
    return 'Si crees que puede haber embarazo, una prueba de embarazo puede ayudarte a aclararlo; sigue las instrucciones del producto o consulta en un centro de salud. Si hubo sexo sin protección recientemente, pregunta cuanto antes a personal de salud por las opciones disponibles. No puedo confirmar un embarazo por chat.';
  }
  if (/anticoncept|condon|preservativo|pastilla/.test(q)) {
    return 'Hay distintos métodos anticonceptivos y no todos protegen contra infecciones de transmisión sexual (ITS). El condón, usado correctamente, ayuda a reducir el riesgo de ITS y embarazo. Un profesional de salud puede orientarte para elegir un método adecuado para ti.';
  }
  if (/\bits\b|infeccion|sida|vih|ardor|flujo/.test(q)) {
    return 'Algunas ITS no producen síntomas. Si crees que pudiste exponerte o notas molestias, acude a un centro de salud para recibir orientación y valorar pruebas. Evita automedicarte. El condón reduce el riesgo de muchas ITS.';
  }
  if (/consent|presion|oblig|violencia|no quiero/.test(q)) {
    return 'El consentimiento debe ser libre, claro y puede retirarse en cualquier momento. Nadie tiene derecho a presionarte. Si te sientes en peligro, busca a una persona adulta de confianza o servicios locales de apoyo; ante peligro inmediato, contacta los servicios de emergencia de tu zona.';
  }
  if (/menstru|regla|periodo/.test(q)) {
    return 'Los ciclos menstruales pueden variar. Si tienes dolor intenso, sangrado muy abundante, desmayo o una preocupación persistente, consulta a personal de salud. Este chat no puede diagnosticar la causa de tus síntomas.';
  }
  if (/privacidad|anonim|datos/.test(q)) {
    return 'En esta demostración, el chat funciona dentro de tu navegador y no envía los mensajes a un servidor. Aun así, evita escribir información que te identifique. Si publicas la web, revisa privacidad, seguridad y protección de datos antes de habilitar servicios externos.';
  }
  if (/hola|buenas|ayuda/.test(q)) {
    return '¡Hola! Puedes preguntarme sobre anticonceptivos, embarazo, ITS, menstruación o consentimiento. Te compartiré información general y opciones para buscar apoyo profesional.';
  }
  return 'Gracias por preguntar. Puedo orientar de forma general sobre anticonceptivos, embarazo, ITS, menstruación y consentimiento. Para una situación personal, síntomas o decisiones médicas, lo más seguro es consultar a un profesional de salud.';
}
function sendQuestion(question) {
  const clean = question.trim();
  if (!clean) return;
  addMessage(clean, 'user');
  chatInput.value = '';
  window.setTimeout(() => addMessage(getReply(clean), 'bot'), 250);
}
chatForm.addEventListener('submit', event => {
  event.preventDefault();
  sendQuestion(chatInput.value);
});
document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => sendQuestion(button.dataset.question)));
document.getElementById('clearChat').addEventListener('click', () => {
  chatMessages.replaceChildren();
  addMessage('Conversación reiniciada. ¿Qué tema te gustaría consultar?', 'bot');
});

// Mini test automático.
const questions = [
  { q: '¿Puede ocurrir un embarazo la primera vez que hay sexo vaginal sin anticonceptivos?', options: ['No, nunca', 'Sí, puede ocurrir', 'Solo si hay síntomas'], correct: 1, explain: 'Sí. El embarazo puede ocurrir la primera vez si hay sexo vaginal sin un método anticonceptivo eficaz.' },
  { q: '¿Todas las ITS producen síntomas visibles?', options: ['Sí, todas', 'No, algunas no presentan síntomas', 'Solo en adultos'], correct: 1, explain: 'Algunas ITS pueden no causar síntomas; las pruebas y la orientación de salud son importantes.' },
  { q: '¿Cuál de estas opciones ayuda a reducir el riesgo de muchas ITS?', options: ['Usar correctamente el condón', 'Ducharse después', 'Tomar antibióticos sin receta'], correct: 0, explain: 'El uso correcto del condón ayuda a reducir el riesgo de muchas ITS.' },
  { q: '¿Qué significa consentimiento?', options: ['Aceptar por presión', 'Un sí libre que puede retirarse', 'No poder cambiar de opinión'], correct: 1, explain: 'El consentimiento es libre y puede retirarse en cualquier momento.' },
  { q: '¿Qué debes hacer si tienes una preocupación médica personal?', options: ['Automedicarte', 'Ignorarla siempre', 'Consultar a personal de salud'], correct: 2, explain: 'Un profesional de salud puede valorar tu situación y orientarte de forma adecuada.' }
];
let questionIndex = 0;
let score = 0;
let answered = false;
const quizContent = document.getElementById('quizContent');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const quizFeedback = document.getElementById('quizFeedback');
const quizNext = document.getElementById('quizNext');
function renderQuestion() {
  answered = false;
  quizFeedback.textContent = '';
  quizNext.disabled = true;
  quizNext.textContent = questionIndex === questions.length - 1 ? 'Ver resultado →' : 'Siguiente →';
  progressText.textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
  progressBar.style.width = `${(questionIndex / questions.length) * 100}%`;
  const item = questions[questionIndex];
  quizContent.replaceChildren();
  const title = document.createElement('h3');
  title.className = 'quiz-question';
  title.textContent = item.q;
  quizContent.appendChild(title);
  const options = document.createElement('div');
  options.className = 'quiz-options';
  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option';
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement('span');
    label.textContent = option;
    button.append(letter, label);
    button.addEventListener('click', () => chooseAnswer(index, button, options));
    options.appendChild(button);
  });
  quizContent.appendChild(options);
}
function chooseAnswer(index, selected, options) {
  if (answered) return;
  answered = true;
  const item = questions[questionIndex];
  options.querySelectorAll('button').forEach((button, i) => {
    button.disabled = true;
    if (i === item.correct) button.classList.add('correct');
  });
  if (index === item.correct) {
    score++;
    quizFeedback.textContent = `¡Correcto! ${item.explain}`;
  } else {
    selected.classList.add('incorrect');
    quizFeedback.textContent = `No exactamente. ${item.explain}`;
  }
  quizNext.disabled = false;
}
quizNext.addEventListener('click', () => {
  if (!answered) return;
  questionIndex++;
  if (questionIndex >= questions.length) {
    progressText.textContent = 'Test completado';
    progressBar.style.width = '100%';
    quizContent.replaceChildren();
    const result = document.createElement('div');
    result.innerHTML = `<h3 class="quiz-question">Obtuviste ${score} de ${questions.length} respuestas correctas.</h3><p>${score >= 4 ? '¡Excelente! Sigue consultando fuentes confiables y comparte información responsable.' : '¡Buen trabajo por intentarlo! Repasa las tarjetas de mitos y realidades y vuelve a intentarlo.'}</p>`;
    quizContent.appendChild(result);
    quizFeedback.textContent = 'Este test es educativo, no una evaluación médica.';
    quizNext.textContent = 'Repetir test ↻';
    quizNext.disabled = false;
    quizNext.onclick = () => {
      questionIndex = 0; score = 0; quizNext.onclick = null; renderQuestion();
    };
    return;
  }
  renderQuestion();
});
renderQuestion();
