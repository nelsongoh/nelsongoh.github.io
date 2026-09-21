(() => {
  'use strict';

  document.documentElement.classList.remove('js-pending');
  document.documentElement.classList.add('js');

  const steps = [...document.querySelectorAll('.step')];
  const stage = document.querySelector('.visual-stage');
  const masterCanvas = stage?.querySelector('.stage-canvas');
  const links = [...document.querySelectorAll('[data-jump]')];
  const stageTitle = document.querySelector('#stage-title');
  const progressBar = document.querySelector('.stage-progress i');
  const progressText = document.querySelector('.stage-progress span');
  const replay = document.querySelector('.replay');
  const titles = [
    'A question about payments',
    'Read a payments help page',
    'Split the page into passages',
    'Turn each passage into numbers',
    'Find passages for the question',
    'Give the AI the question and passages',
    'Read the answer and check its source'
  ];
  const excerpts = {
    18: {
      label: 'Passage 1 · Payments → Refunds → Partial refunds',
      text: 'Open the original charge and choose the refund action. Enter the amount to return.'
    },
    19: {
      label: 'Passage 2 · Payments → Refunds → Partial refunds',
      text: 'Enter the amount to return. Review the refund amount before submitting.'
    }
  };
  let active = -1;

  function configureCanvas(canvas, index, suffix) {
    canvas.querySelectorAll('.scene').forEach((scene, sceneIndex) => {
      const selected = sceneIndex === index;
      scene.classList.toggle('is-active', selected);
      scene.setAttribute('aria-hidden', selected ? 'false' : 'true');
      scene.inert = !selected;
    });

    const source = canvas.querySelector('.citation-source');
    const citation = canvas.querySelector('.citation-button');
    if (source && citation) {
      const sourceId = suffix ? `citation-source-${suffix}` : 'citation-source';
      source.id = sourceId;
      source.hidden = true;
      citation.setAttribute('aria-controls', sourceId);
      citation.setAttribute('aria-expanded', 'false');
      citation.dataset.pinned = 'false';
    }
  }

  function showExcerpt(control) {
    const key = control.dataset.excerpt;
    const excerpt = excerpts[key];
    if (!excerpt) return;
    const canvas = control.closest('.stage-canvas');
    if (!canvas) return;

    const readout = canvas.querySelector('.vector-readout');
    if (readout) readout.innerHTML = `<b>${excerpt.label}</b><span>${excerpt.text}</span>`;

    canvas.querySelectorAll('.embedding-point[data-excerpt]').forEach(item => {
      item.classList.toggle('is-selected', item.dataset.excerpt === key);
    });
  }

  function wireCanvas(canvas) {
    canvas.querySelectorAll('.embedding-point[data-excerpt]').forEach(control => {
      control.addEventListener('click', () => showExcerpt(control));
    });

    const citation = canvas.querySelector('.citation-button');
    const source = canvas.querySelector('.citation-source');
    if (!citation || !source) return;

    const reveal = () => {
      source.hidden = false;
      citation.setAttribute('aria-expanded', 'true');
      citation.closest('.answer-window')?.classList.add('is-citing');
    };
    const conceal = () => {
      if (citation.dataset.pinned === 'true') return;
      source.hidden = true;
      citation.setAttribute('aria-expanded', 'false');
      citation.closest('.answer-window')?.classList.remove('is-citing');
    };

    citation.addEventListener('click', () => {
      const willPin = citation.dataset.pinned !== 'true';
      citation.dataset.pinned = String(willPin);
      if (willPin) reveal();
      else {
        source.hidden = true;
        citation.setAttribute('aria-expanded', 'false');
        citation.closest('.answer-window')?.classList.remove('is-citing');
      }
    });
    citation.addEventListener('mouseenter', reveal);
    citation.addEventListener('mouseleave', conceal);
    citation.addEventListener('focus', reveal);
    citation.addEventListener('blur', conceal);
  }

  function buildMobileVisuals() {
    if (!masterCanvas) return;
    steps.forEach((step, index) => {
      const slot = step.querySelector('.step-slot');
      if (!slot) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'mobile-stage';
      wrapper.dataset.stage = String(index);
      const canvas = masterCanvas.cloneNode(true);
      canvas.removeAttribute('aria-live');
      wrapper.appendChild(canvas);
      slot.appendChild(wrapper);
      configureCanvas(canvas, index, `mobile-${index}`);
      wireCanvas(canvas);
    });
  }

  function activate(index) {
    if (!stage || index < 0 || index >= steps.length) return;
    if (index === active) return;
    active = index;
    stage.dataset.stage = String(index);

    steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
    links.forEach((link, linkIndex) => {
      if (linkIndex === index) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });

    configureCanvas(masterCanvas, index, '');
    if (stageTitle) stageTitle.textContent = titles[index];
    if (progressBar) progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
    if (progressText) progressText.textContent = `${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
  }

  buildMobileVisuals();
  if ('IntersectionObserver' in window) {
    const mobileObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-replaying');
          mobileObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.mobile-stage .scene.is-active').forEach(scene => {
      scene.classList.add('is-replaying');
      mobileObserver.observe(scene);
    });
  }
  if (masterCanvas) wireCanvas(masterCanvas);
  activate(0);

  replay?.addEventListener('click', () => {
    const scene = masterCanvas?.querySelector('.scene.is-active');
    if (!scene) return;
    scene.classList.add('is-replaying');
    void scene.offsetWidth;
    scene.classList.remove('is-replaying');
  });

  let framePending = false;
  function updateFromScroll() {
    framePending = false;
    const marker = window.innerHeight * 0.42;
    let chosen = 0;
    let nearestDistance = Infinity;
    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) {
        chosen = index;
        nearestDistance = -1;
      } else if (nearestDistance >= 0) {
        const distance = Math.min(Math.abs(rect.top - marker), Math.abs(rect.bottom - marker));
        if (distance < nearestDistance) {
          nearestDistance = distance;
          chosen = index;
        }
      }
    });
    activate(chosen);
  }
  function requestUpdate() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateFromScroll);
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateFromScroll();
})();
