/* NASCERE V2 — Sources and attributions panel. */
window.addEventListener('DOMContentLoaded', () => {
  const topActions = document.querySelector('.top-actions');
  const resetButton = document.getElementById('reset-view');
  const panel = document.getElementById('exhibit-panel');
  const panelIndex = document.getElementById('panel-index');
  const panelCategory = document.getElementById('panel-category');
  const panelEyebrow = document.getElementById('panel-eyebrow');
  const panelTitle = document.getElementById('panel-title');
  const panelLead = document.getElementById('panel-lead');
  const panelBody = document.getElementById('panel-body');
  const panelProgress = document.getElementById('panel-progress');

  if (!topActions || !panel) return;

  const button = document.createElement('button');
  button.id = 'references-toggle';
  button.className = 'utility-button';
  button.type = 'button';
  button.textContent = 'REFERENCIAS';
  button.setAttribute('aria-label', 'Referencias y atribuciones');
  topActions.insertBefore(button, resetButton || null);

  const COPY = {
    es: {
      button: 'REFERENCIAS',
      category: 'CRÉDITOS',
      eyebrow: 'FUENTES Y ATRIBUCIONES',
      title: 'Referencias del museo',
      lead: 'Recursos externos utilizados como referencia de diseño o como base técnica en el desarrollo de Nascere.',
      body: `
        <p><strong>Banco paramétrico</strong><br>
        Diseño de referencia: Brendan Harmon, <em>Parametric Bench</em>. La versión incluida en Nascere es una adaptación geométrica para WebXR basada en su método de Grasshopper: dos curvas, superficie, extrusión y apoyos.</p>
        <p><a href="https://baharmon.github.io/parametric-bench/" target="_blank" rel="noopener noreferrer" style="color:#176d76;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(23,109,118,.32);">Ver tutorial original de Brendan Harmon ↗</a></p>
        <p>La definición de Grasshopper asociada al tutorial se publica en el repositorio <em>generative-design</em> de Brendan Harmon, bajo licencia GNU GPL v2.</p>
        <p><a href="https://github.com/baharmon/generative-design/blob/main/grasshopper/parametric-bench.gh" target="_blank" rel="noopener noreferrer" style="color:#176d76;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(23,109,118,.32);">Ver definición original de Grasshopper ↗</a></p>
      `
    },
    en: {
      button: 'REFERENCES',
      category: 'CREDITS',
      eyebrow: 'SOURCES AND ATTRIBUTIONS',
      title: 'Museum references',
      lead: 'External resources used as design references or technical foundations in the development of Nascere.',
      body: `
        <p><strong>Parametric bench</strong><br>
        Design reference: Brendan Harmon, <em>Parametric Bench</em>. The version included in Nascere is a WebXR geometric adaptation based on his Grasshopper method: two curves, surface, extrusion and end supports.</p>
        <p><a href="https://baharmon.github.io/parametric-bench/" target="_blank" rel="noopener noreferrer" style="color:#176d76;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(23,109,118,.32);">Open Brendan Harmon's original tutorial ↗</a></p>
        <p>The Grasshopper definition associated with the tutorial is published in Brendan Harmon's <em>generative-design</em> repository under the GNU GPL v2 license.</p>
        <p><a href="https://github.com/baharmon/generative-design/blob/main/grasshopper/parametric-bench.gh" target="_blank" rel="noopener noreferrer" style="color:#176d76;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(23,109,118,.32);">Open original Grasshopper definition ↗</a></p>
      `
    }
  };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'es';
  }

  function syncButtonLabel() {
    const copy = COPY[language()];
    button.textContent = copy.button;
    button.setAttribute('aria-label', language() === 'en' ? 'References and attributions' : 'Referencias y atribuciones');
  }

  function openReferences() {
    const copy = COPY[language()];
    panel.dataset.exhibit = 'references';
    panelIndex.textContent = 'R';
    panelCategory.textContent = copy.category;
    panelEyebrow.textContent = copy.eyebrow;
    panelTitle.textContent = copy.title;
    panelLead.textContent = copy.lead;
    panelBody.innerHTML = copy.body;
    panelProgress.textContent = 'REF';
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');

    const intro = document.getElementById('intro-card');
    if (intro) intro.classList.add('is-hidden');
  }

  button.addEventListener('click', openReferences);

  document.querySelectorAll('[data-language]').forEach((languageButton) => {
    languageButton.addEventListener('click', () => {
      window.setTimeout(() => {
        syncButtonLabel();
        if (panel.classList.contains('is-open') && panel.dataset.exhibit === 'references') {
          openReferences();
        }
      }, 0);
    });
  });

  syncButtonLabel();
});
