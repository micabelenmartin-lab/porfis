document.addEventListener('DOMContentLoaded', () => {

  /* ============ ELEMENTOS ============ */
  const envelope   = document.getElementById('envelope');
  const stage      = document.getElementById('stage');
  const hint       = document.getElementById('hint');
  const card       = document.getElementById('card');
  const cardInner  = card.querySelector('.card__inner');
  const buttonsBox = document.getElementById('buttons');
  const btnYes     = document.getElementById('btnYes');
  const btnNo      = document.getElementById('btnNo');
  const counterEl  = document.getElementById('counter');
  const success    = document.getElementById('success');
  const btnAgain   = document.getElementById('btnAgain');
  const canvas     = document.getElementById('confetti');
  const ctx        = canvas.getContext('2d');

  const flyingUnicorn = document.getElementById('flyingUnicorn');
  const btnDetails    = document.getElementById('btnDetails');
  const formModal     = document.getElementById('formModal');
  const meriendaForm   = document.getElementById('merienda-form');
  const btnEnviar      = document.getElementById('btnEnviar');
  const formStatus     = document.getElementById('formStatus');
  const sentScreen     = document.getElementById('sentScreen');

  const EMAIL_DESTINO = 'micabelenmartin@gmail.com';

  let dodgeCount = 0;
  let yesScale   = 1;

  const frasesEscape = [
    'jaja, ¡ni ahí! 🏃‍♀️',
    'no me vas a agarrar 😜',
    '¿en serio? ¡nop! 🦄💨',
    'el "no" se fue a cenar solo 🍝',
    'más lejos, más dulce el "sí" 💕',
    'seguime si podés 😏'
  ];

  /* ============ 1. ABRIR EL SOBRE ============ */
  envelope.addEventListener('click', abrirSobre);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') abrirSobre();
  });

  function abrirSobre(){
    if (envelope.classList.contains('is-open')) return;
    envelope.classList.add('is-open');
    hint.style.opacity = '0';

    setTimeout(() => {
      stage.classList.add('is-hidden');
      card.classList.add('is-visible');
      posicionarBotonNo(true); // ubicación inicial prolija
    }, 550);
  }

  /* ============ 2. EL BOTÓN "NO" QUE ESCAPA ============ */

  function posicionarBotonNo(inicial = false){
    const boxRect = buttonsBox.getBoundingClientRect();
    const noRect  = btnNo.getBoundingClientRect();

    if (inicial){
      // lo deja en su lugar natural, sin position absolute todavía
      return;
    }

    card.classList.add('is-fleeing');

    const padding = 10;
    const maxX = boxRect.width  - noRect.width  - padding;
    const maxY = boxRect.height - noRect.height - padding;

    // si la tarjeta es chica, usamos toda la tarjeta como área de fuga
    const innerRect = cardInner.getBoundingClientRect();
    const areaW = Math.max(maxX, innerRect.width  - noRect.width  - 40);
    const areaH = Math.max(maxY, innerRect.height - noRect.height - 160);

    const newX = Math.random() * Math.max(areaW, 20);
    const newY = Math.random() * Math.max(areaH, 20);

    btnNo.style.left = `${newX}px`;
    btnNo.style.top  = `${newY}px`;
  }

  function reaccionarEscape(origen){
    dodgeCount++;
    posicionarBotonNo();

    // el "sí" crece un poquito cada vez, invitando más y más
    yesScale = Math.min(1 + dodgeCount * 0.06, 1.6);
    btnYes.style.transform = `scale(${yesScale})`;
    btnYes.style.fontSize = `${16 + Math.min(dodgeCount, 8)}px`;

    const frase = frasesEscape[Math.min(dodgeCount - 1, frasesEscape.length - 1)] || frasesEscape[frasesEscape.length - 1];
    counterEl.textContent = dodgeCount >= 1 ? frase : '';
  }

  // Desktop: el botón huye cuando el mouse se acerca
  document.addEventListener('mousemove', (e) => {
    if (!card.classList.contains('is-visible')) return;
    if (success.classList.contains('is-visible')) return;

    const rect = btnNo.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

    if (dist < 90) {
      reaccionarEscape('mouse');
    }
  });

  // También escapa si logran hacer click/tap (por si el mouse llega rápido)
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    reaccionarEscape('click');
  });

  // Mobile / touch: al tocar cerca, también escapa
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    reaccionarEscape('touch');
  }, { passive: false });

  // Si la ventana cambia de tamaño, evitamos que quede fuera de la tarjeta
  window.addEventListener('resize', () => {
    if (card.classList.contains('is-fleeing')) posicionarBotonNo();
  });

  /* ============ 3. EL BOTÓN "SÍ" ============ */
  btnYes.addEventListener('click', () => {
    card.classList.remove('is-visible');

    setTimeout(() => {
      // el unicornio cruza la pantalla volando
      flyingUnicorn.classList.remove('is-flying');
      void flyingUnicorn.offsetWidth; // fuerza el reinicio de la animación
      flyingUnicorn.classList.add('is-flying');
    }, 350);

    setTimeout(() => {
      success.classList.add('is-visible');
      lanzarConfetti();
    }, 350 + 1500); // recién después de que termina el vuelo
  });

  // botón de la pantalla de éxito: abre el formulario de horario y antojos
  btnDetails.addEventListener('click', () => {
    success.classList.remove('is-visible');
    setTimeout(() => {
      formModal.classList.add('is-visible');
    }, 300);
  });

  btnAgain.addEventListener('click', reiniciarTodo);

  function reiniciarTodo(){
    sentScreen.classList.remove('is-visible');
    success.classList.remove('is-visible');
    formModal.classList.remove('is-visible');
    envelope.classList.remove('is-open');
    stage.classList.remove('is-hidden');
    card.classList.remove('is-fleeing');
    hint.style.opacity = '1';
    dodgeCount = 0;
    yesScale = 1;
    btnYes.style.transform = 'scale(1)';
    btnYes.style.fontSize = '16px';
    btnNo.style.left = '';
    btnNo.style.top = '';
    counterEl.textContent = '';
    meriendaForm.reset();
    document.querySelectorAll('.chip input:checked').forEach(c => c.checked = false);
    formStatus.textContent = '';
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar propuesta 💌';
    resizeCanvas();
  }

  /* ============ 4. ENVIAR EL FORMULARIO POR MAIL ============ */
  meriendaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const horario = document.getElementById('horario').value;
    const otro    = document.getElementById('otro_antojo').value.trim();
    const antojosSeleccionados = Array.from(
      document.querySelectorAll('#antojos input[name="antojos"]:checked')
    ).map(el => el.value);

    if (!horario) {
      formStatus.textContent = 'Elegí un horario primero 🕓💜';
      return;
    }

    let listaAntojos = antojosSeleccionados.join(', ');
    if (otro) listaAntojos = listaAntojos ? `${listaAntojos}, ${otro}` : otro;
    if (!listaAntojos) listaAntojos = 'sorprendeme vos 😋';

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando... 💌';
    formStatus.textContent = '';

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${EMAIL_DESTINO}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: '🍽️ ¡Propuesta de cena!',
          Fecha: '15 - 07',
          Horario: horario,
          Antojos: listaAntojos
        })
      });

      if (!res.ok) throw new Error('fallo el envío');

      formModal.classList.remove('is-visible');
      setTimeout(() => {
        sentScreen.classList.add('is-visible');
      }, 300);

    } catch (err) {
      formStatus.textContent = 'Uy, no se pudo enviar. ¿Intentamos de nuevo? 💔';
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar propuesta 💌';
    }
  });

  /* ============ 4. CONFETTI DE CORAZONES ============ */
  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const emojis = ['💖','💗','💕','🦄','✨','🌈','🧁'];
  let particles = [];
  let confettiRAF = null;

  function lanzarConfetti(){
    particles = [];
    const total = 70;
    for (let i = 0; i < total; i++){
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        size: 16 + Math.random() * 16,
        speed: 1.5 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 1.6,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        life: 0,
        maxLife: 260 + Math.random() * 120
      });
    }
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    animarConfetti();
  }

  function animarConfetti(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let vivas = false;

    particles.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;
      p.life++;

      if (p.life < p.maxLife && p.y < canvas.height + 40) {
        vivas = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }
    });

    if (vivas) {
      confettiRAF = requestAnimationFrame(animarConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

});
