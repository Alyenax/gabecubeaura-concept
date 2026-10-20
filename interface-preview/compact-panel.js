/* Proposed quick panel only. Browser-local rehearsal; no plugin, microphone or power API. */
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const selected = (a, b) => a === b ? ' selected' : '';
  const english = {
    'Éclairage':'Lighting', 'Minuteur':'Timer', 'Temps restant':'Time remaining', 'Démarrer…':'Start…',
    'Arrêter':'Stop', 'Aucune action à la fin':'No action when finished', 'Mise en veille à la fin':'Sleep when finished', 'Extinction à la fin':'Shut down when finished',
    'Barre lumineuse':'Light bar', 'Luminosité':'Brightness', 'Ambiance':'Ambience', 'Discret':'Subtle', 'Atmosphère':'Atmosphere', 'Signaux':'Signals', 'Immersif':'Immersive', 'Personnalisée':'Custom',
    'Météo':'Weather', 'Éteint':'Off', 'Affichage actuel':'Current display', 'Assistant vocal':'Voice assistant', 'Micro de l’assistant':'Assistant microphone', 'Faire taire':'Stop speaking',
    'Écran JSAUX':'JSAUX screen', 'Utilisé par une autre application':'In use by another app', 'Déconnecté · choix conservé':'Disconnected · choices kept', 'Affichage du jeu…':'Game display…',
    'Démarrer un minuteur':'Start a timer', 'Durées rapides':'Quick durations', '1 h':'1 hr', 'Durée en minutes':'Duration in minutes', 'À la fin':'When finished', 'Ne rien faire':'Do nothing', 'Mettre en veille':'Put console to sleep', 'Éteindre la console':'Shut down console',
    'Le minuteur ne modifiera pas l’état de la console.':'The timer will not change the console’s power state.', 'Démarrer':'Start', 'Annuler':'Cancel', 'Confirmer et démarrer':'Confirm and start',
    'Maquette : cette action sera seulement simulée. Dans le plugin, sauvegardez votre partie avant de démarrer.':'Preview: this action is simulated only. In the plugin, save your game before starting.',
    'Aperçu de la barre LED':'LED light bar preview', 'Illustration du jeu':'Game artwork', 'Accueil':'Home',
    'Vue':'View', 'Situation simulée':'Simulated situation', 'Jeu d’exemple':'Sample game', 'Langue du panneau':'Panel language', 'Aperçus visuels':'Visual previews',
    'Assistant déjà configuré':'Assistant already configured', 'Simuler une réponse vocale':'Simulate a voice response',
    'Raccourcis Decky · proposition':'Decky shortcuts · proposal', 'Réglages · ancienne démo':'Settings · historical demo', 'Première utilisation · ancienne démo':'First-run setup · historical demo',
    'Accueil · JSAUX connectée':'Home · JSAUX connected', 'En jeu · JSAUX connectée':'In game · JSAUX connected', 'Accueil · sans JSAUX':'Home · no JSAUX', 'En jeu · sans JSAUX':'In game · no JSAUX', 'Accueil · JSAUX déconnectée':'Home · JSAUX disconnected', 'En jeu · JSAUX occupée':'In game · JSAUX busy',
    'PROPOSITION DE PANNEAU · SIMULATION SANS ACTION SUR LE PLUGIN':'PANEL PROPOSAL · SIMULATION WITHOUT PLUGIN ACTIONS', 'Raccourcis':'Shortcuts', 'Réglages':'Settings',
    'Maquette interactive · aucune action réelle.':'Interactive preview · no real actions.',
    'Éclairage activé · choix conservés.':'Lighting enabled · choices kept.', 'Éclairage coupé · minuteur et micro inchangés.':'Lighting off · timer and microphone unchanged.',
    'Luminosité modifiée dans la maquette uniquement.':'Brightness changed in the preview only.', 'Ambiance modifiée · luminosité conservée.':'Ambience changed · brightness kept.',
    'Écoute simulée activée. Aucun micro ouvert.':'Simulated listening enabled. No microphone opened.', 'Micro de l’assistant coupé dans la maquette.':'Assistant microphone disabled in the preview.',
    'Réponse arrêtée · écoute inchangée.':'Speech stopped · listening unchanged.', 'Affichage JSAUX modifié dans la maquette. Aucun transfert.':'JSAUX display changed in the preview. No transfer.',
    'Minuteur démarré dans la maquette. Aucune action réelle.':'Timer started in the preview. No real action.', '15 minutes ajoutées au minuteur simulé.':'15 minutes added to the simulated timer.', 'Minuteur arrêté · action de fin annulée.':'Timer stopped · end action cancelled.',
    'Assistant configuré pour cet exemple seulement.':'Assistant configured for this example only.', 'Raccourci assistant masqué.':'Assistant shortcut hidden.',
    'Réponse vocale simulée, sans lecture audio. « Faire taire » arrête la réponse sans couper le micro.':'Simulated speech, without audio. Stop speaking ends the response without disabling the microphone.',
    'Minuteur terminé.':'Timer finished.', 'Minuteur terminé · mise en veille simulée uniquement.':'Timer finished · sleep simulated only.', 'Minuteur terminé · extinction simulée uniquement.':'Timer finished · shutdown simulated only.',
    'Aperçus activés · aucune action réelle.':'Visual previews enabled · no real actions.', 'Aperçus masqués · raccourcis conservés.':'Visual previews hidden · shortcuts kept.',
    'Aperçu de couleurs illustratif, sans matériel.':'Illustrative colour preview, no hardware.',
    'Réglages et première utilisation : ancienne démo Lab 131 en anglais. Aucun micro, transfert USB ni commande Steam. Le focus natif reste à valider dans Decky.':'Settings and first-run setup: historical Lab 131 demo in English. No microphone, USB transfer or Steam command. Native focus still needs validation in Decky.'
  };
  const translate = (text, language) => language === 'en' ? english[text] ?? text : text;
  const remaining = deadline => {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  let lastFocus = 'timer';
  function render(root, model, actions) {
    const t = text => translate(text, model.language);
    const active = model.timer.deadline > Date.now();
    const disabled = !model.enabled;
    const face = model.faceplate;
    const faceDisabled = disabled || !face.connected || face.busy;
    const faceValue = !face.powered ? 'off' : face.route;
    const presets = [['moderate',t('Discret')],['atmosphere',t('Atmosphère')],['signals',t('Signaux')],['immersive',t('Immersif')]];
    const faceOptions = [['dashboard','Dashboard'],['weather',t('Météo')],['artwork','Artwork'],['off',t('Éteint')]];
    if (!presets.some(([value]) => value === model.preset)) presets.push([model.preset,t('Personnalisée')]);
    if (!faceOptions.some(([value]) => value === faceValue)) faceOptions.push([faceValue,t('Affichage actuel')]);
    root.className = 'compact-panel';
    root.innerHTML = `
      ${model.visuals ? `<section class="compact-visual" aria-label="${t('Aperçu de la barre LED')}">${model.game ? `<button class="compact-art-link" type="button" data-compact="game" aria-label="${t('Affichage du jeu…')} ${escape(model.game)}"><img class="compact-game-art" src="${escape(model.artwork)}" alt="${t('Illustration du jeu')} · ${escape(model.game)}"><span class="compact-game-title">${escape(model.game)}</span></button>` : `<span class="compact-game-title">${t('Accueil')}</span>`}<div class="palette compact-led" data-bar-palette role="img" aria-label="${t('Aperçu de la barre LED')}" aria-description="${t('Aperçu de couleurs illustratif, sans matériel.')}">${'<i></i>'.repeat(17)}</div></section>` : ''}
      <div class="compact-master"><label class="switch-row" for="compact-enabled">${t('Éclairage')}<input id="compact-enabled" data-compact="enabled" type="checkbox" role="switch" ${model.enabled ? 'checked' : ''}></label></div>
      <section class="compact-timer" aria-labelledby="compact-timer-heading">
        <div class="compact-line"><span id="compact-timer-heading">${t('Minuteur')}</span>${active
          ? `<output class="compact-clock" data-compact-clock aria-label="${t('Temps restant')}">${remaining(model.timer.deadline)}</output>`
          : `<button type="button" data-compact="timer">${t('Démarrer…')}</button>`}</div>
        ${active ? `<div class="compact-timer-actions"><button type="button" data-compact="extend">+15 min</button><button type="button" data-compact="stop">${t('Arrêter')}</button></div><small>${t(({none:'Aucune action à la fin',sleep:'Mise en veille à la fin',shutdown:'Extinction à la fin'})[model.timer.endAction])}</small>` : ''}
      </section>
      <section class="compact-light" aria-label="${t('Barre lumineuse')}">
        <div class="compact-line"><label for="compact-brightness">${t('Luminosité')}</label><output id="compact-brightness-value" for="compact-brightness">${Math.round(model.brightness / 255 * 100)} %</output></div>
        <input id="compact-brightness" data-compact="brightness" type="range" min="0" max="255" step="1" value="${model.brightness}" ${disabled ? 'disabled' : ''}>
        <div class="compact-line"><label for="compact-ambience">${t('Ambiance')}</label><select id="compact-ambience" data-compact="ambience" ${disabled ? 'disabled' : ''}>${presets.map(([value,label]) => `<option value="${escape(value)}"${selected(value,model.preset)}>${label}</option>`).join('')}</select></div>
      </section>
      ${model.assistant.ready ? `<section class="compact-assistant" aria-label="${t('Assistant vocal')}"><label class="switch-row" for="compact-microphone">${t('Micro de l’assistant')}<input id="compact-microphone" data-compact="microphone" type="checkbox" role="switch" ${model.assistant.enabled ? 'checked' : ''}></label>${model.assistant.speaking ? `<button type="button" data-compact="silence">${t('Faire taire')}</button>` : ''}</section>` : ''}
      ${face.visible ? `<section class="compact-faceplate" aria-label="Faceplate JSAUX"><div class="compact-line"><label for="compact-faceplate">${t('Écran JSAUX')}</label><select id="compact-faceplate" data-compact="faceplate" ${faceDisabled ? 'disabled' : ''}>${faceOptions.map(([value,label]) => `<option value="${escape(value)}"${selected(value,faceValue)}>${label}</option>`).join('')}</select></div>${!face.connected || face.busy ? `<small>${t(face.busy ? 'Utilisé par une autre application' : 'Déconnecté · choix conservé')}</small>` : ''}</section>` : ''}
      ${model.game && !model.visuals ? `<div class="compact-context"><span>${escape(model.game)}</span><button type="button" data-compact="game">${t('Affichage du jeu…')}</button></div>` : ''}`;
    root.onclick = event => {
      const button = event.target.closest('button[data-compact]');
      if (!button || button.disabled) return;
      const action = button.dataset.compact;
      if (action === 'timer') {
        actions.dialog(t('Démarrer un minuteur'), `<div class="compact-duration-options" aria-label="${t('Durées rapides')}"><button type="button" data-duration="30">30 min</button><button type="button" data-duration="60">${t('1 h')}</button></div><label class="compact-dialog-label" for="compact-duration">${t('Durée en minutes')}</label><input id="compact-duration" type="number" min="1" max="240" step="1" required value="${model.timer.minutes}"><label class="compact-dialog-label" for="compact-end-action">${t('À la fin')}</label><select id="compact-end-action"><option value="none">${t('Ne rien faire')}</option><option value="sleep">${t('Mettre en veille')}</option><option value="shutdown">${t('Éteindre la console')}</option></select><p id="compact-power-note">${t('Le minuteur ne modifiera pas l’état de la console.')}</p>`, () => {
          const minutes = Number(document.getElementById('compact-duration').value);
          const endAction = document.getElementById('compact-end-action').value;
          if (Number.isInteger(minutes) && minutes >= 1 && minutes <= 240) actions.startTimer(minutes, endAction);
        });
        const dialog = document.getElementById('preview-dialog');
        const confirm = document.getElementById('dialog-confirm');
        dialog.lang = model.language;
        confirm.textContent = t('Démarrer');
        dialog.querySelector('button[value="cancel"]').textContent = t('Annuler');
        dialog.querySelectorAll('[data-duration]').forEach(button => button.onclick = () => {
          document.getElementById('compact-duration').value = button.dataset.duration;
        });
        document.getElementById('compact-end-action').onchange = event => {
          const power = event.target.value !== 'none';
          confirm.textContent = t(power ? 'Confirmer et démarrer' : 'Démarrer');
          document.getElementById('compact-power-note').textContent = t(power
            ? 'Maquette : cette action sera seulement simulée. Dans le plugin, sauvegardez votre partie avant de démarrer.'
            : 'Le minuteur ne modifiera pas l’état de la console.');
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
    render, translate,
    restoreFocus(root, key = lastFocus) { root.querySelector(`[data-compact="${key}"]:not(:disabled)`)?.focus({preventScroll:true}); },
    tick(root, deadline) { const clock = root.querySelector('[data-compact-clock]'); if (clock) clock.textContent = remaining(deadline); }
  };
})();
