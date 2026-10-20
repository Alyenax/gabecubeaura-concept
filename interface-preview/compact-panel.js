/* Proposed quick panel only. Browser-local rehearsal; no plugin, microphone or power API. */
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const selected = (a, b) => a === b ? ' selected' : '';
  const remaining = deadline => {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  let lastFocus = 'timer';
  function render(root, model, actions) {
    const active = model.timer.deadline > Date.now();
    const disabled = !model.enabled;
    const face = model.faceplate;
    const faceDisabled = disabled || !face.connected || face.busy;
    const faceValue = !face.powered ? 'off' : face.route;
    const presets = [['moderate','Discret'],['atmosphere','Atmosphère'],['signals','Signaux'],['immersive','Immersif']];
    const faceOptions = [['dashboard','Dashboard'],['weather','Météo'],['artwork','Artwork'],['off','Éteint']];
    if (!presets.some(([value]) => value === model.preset)) presets.push([model.preset,'Personnalisée']);
    if (!faceOptions.some(([value]) => value === faceValue)) faceOptions.push([faceValue,'Affichage actuel']);
    root.className = 'compact-panel';
    root.innerHTML = `
      <div class="compact-master"><label class="switch-row" for="compact-enabled">Éclairage<input id="compact-enabled" data-compact="enabled" type="checkbox" role="switch" ${model.enabled ? 'checked' : ''}></label></div>
      <section class="compact-timer" aria-labelledby="compact-timer-heading">
        <div class="compact-line"><span id="compact-timer-heading">Minuteur</span>${active
          ? `<output class="compact-clock" data-compact-clock aria-label="Temps restant">${remaining(model.timer.deadline)}</output>`
          : '<button type="button" data-compact="timer">Démarrer…</button>'}</div>
        ${active ? `<div class="compact-timer-actions"><button type="button" data-compact="extend">+15 min</button><button type="button" data-compact="stop">Arrêter</button></div><small>${({none:'Aucune action à la fin',sleep:'Mise en veille à la fin',shutdown:'Extinction à la fin'})[model.timer.endAction]}</small>` : ''}
      </section>
      <section class="compact-light" aria-label="Barre lumineuse">
        <div class="compact-line"><label for="compact-brightness">Luminosité</label><output id="compact-brightness-value" for="compact-brightness">${Math.round(model.brightness / 255 * 100)} %</output></div>
        <input id="compact-brightness" data-compact="brightness" type="range" min="0" max="255" step="1" value="${model.brightness}" ${disabled ? 'disabled' : ''}>
        <div class="compact-line"><label for="compact-ambience">Ambiance</label><select id="compact-ambience" data-compact="ambience" ${disabled ? 'disabled' : ''}>${presets.map(([value,label]) => `<option value="${escape(value)}"${selected(value,model.preset)}>${label}</option>`).join('')}</select></div>
      </section>
      ${model.assistant.ready ? `<section class="compact-assistant" aria-label="Assistant vocal"><label class="switch-row" for="compact-microphone">Micro de l’assistant<input id="compact-microphone" data-compact="microphone" type="checkbox" role="switch" ${model.assistant.enabled ? 'checked' : ''}></label>${model.assistant.speaking ? '<button type="button" data-compact="silence">Faire taire</button>' : ''}</section>` : ''}
      ${face.visible ? `<section class="compact-faceplate" aria-label="Faceplate JSAUX"><div class="compact-line"><label for="compact-faceplate">Écran JSAUX</label><select id="compact-faceplate" data-compact="faceplate" ${faceDisabled ? 'disabled' : ''}>${faceOptions.map(([value,label]) => `<option value="${escape(value)}"${selected(value,faceValue)}>${label}</option>`).join('')}</select></div>${!face.connected || face.busy ? `<small>${face.busy ? 'Utilisé par une autre application' : 'Déconnecté · choix conservé'}</small>` : ''}</section>` : ''}
      ${model.game ? `<div class="compact-context"><span>${escape(model.game)}</span><button type="button" data-compact="game">Affichage du jeu…</button></div>` : ''}`;
    root.onclick = event => {
      const button = event.target.closest('button[data-compact]');
      if (!button || button.disabled) return;
      const action = button.dataset.compact;
      if (action === 'timer') {
        actions.dialog('Démarrer un minuteur', `<div class="compact-duration-options" aria-label="Durées rapides"><button type="button" data-duration="30">30 min</button><button type="button" data-duration="60">1 h</button></div><label class="compact-dialog-label" for="compact-duration">Durée en minutes</label><input id="compact-duration" type="number" min="1" max="240" step="1" required value="${model.timer.minutes}"><label class="compact-dialog-label" for="compact-end-action">À la fin</label><select id="compact-end-action"><option value="none">Ne rien faire</option><option value="sleep">Mettre en veille</option><option value="shutdown">Éteindre la console</option></select><p id="compact-power-note">Le minuteur ne modifiera pas l’état de la console.</p>`, () => {
          const minutes = Number(document.getElementById('compact-duration').value);
          const endAction = document.getElementById('compact-end-action').value;
          if (Number.isInteger(minutes) && minutes >= 1 && minutes <= 240) actions.startTimer(minutes, endAction);
        });
        const dialog = document.getElementById('preview-dialog');
        const confirm = document.getElementById('dialog-confirm');
        confirm.textContent = 'Démarrer';
        dialog.querySelector('button[value="cancel"]').textContent = 'Annuler';
        dialog.querySelectorAll('[data-duration]').forEach(button => button.onclick = () => {
          document.getElementById('compact-duration').value = button.dataset.duration;
        });
        document.getElementById('compact-end-action').onchange = event => {
          const power = event.target.value !== 'none';
          confirm.textContent = power ? 'Confirmer et démarrer' : 'Démarrer';
          document.getElementById('compact-power-note').textContent = power
            ? 'Maquette : cette action sera seulement simulée. Dans le plugin, sauvegardez votre partie avant de démarrer.'
            : 'Le minuteur ne modifiera pas l’état de la console.';
        };
        dialog.addEventListener('close', () => root.querySelector('[data-compact="timer"], [data-compact="extend"]')?.focus(), {once:true});
      } else if (action === 'game') actions.openGame();
      else if (action === 'extend') actions.extendTimer();
      else if (action === 'stop') actions.stopTimer();
      else if (action === 'silence') actions.silence();
    };
    root.oninput = event => {
      if (event.target.dataset.compact !== 'brightness') return;
      const value = Number(event.target.value);
      root.querySelector('#compact-brightness-value').textContent = `${Math.round(value / 255 * 100)} %`;
      actions.brightness(value);
    };
    root.onchange = event => {
      const control = event.target;
      const kind = control.dataset.compact;
      lastFocus = kind;
      if (kind === 'enabled') actions.enabled(control.checked);
      else if (kind === 'ambience') actions.ambience(control.value);
      else if (kind === 'microphone') actions.microphone(control.checked);
      else if (kind === 'faceplate') actions.faceplate(control.value);
    };
    root.onkeydown = event => {
      if (!['ArrowUp','ArrowDown'].includes(event.key) || event.target.matches('select,input[type="range"]')) return;
      const controls = [...root.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled)')];
      const index = controls.indexOf(event.target);
      if (index < 0) return;
      event.preventDefault();
      controls[Math.max(0,Math.min(controls.length - 1,index + (event.key === 'ArrowDown' ? 1 : -1)))].focus();
    };
  }
  window.GCACompactPanel = {
    render,
    restoreFocus(root, key = lastFocus) { root.querySelector(`[data-compact="${key}"]:not(:disabled)`)?.focus({preventScroll:true}); },
    tick(root, deadline) { const clock = root.querySelector('[data-compact-clock]'); if (clock) clock.textContent = remaining(deadline); }
  };
})();
