/* The 3-9-17 Formula — app
   State machine, rendering, autosave/resume, result + email/print/download. */

(function () {
  var C = window.CONTENT;
  var STORAGE_KEY = '3917-state-v1';

  var MIRROR = {
    checks: {
      c1: { yes: 'You’ve set crystal clear expectations for this role.', notFully: 'You haven’t been fully clear on what winning looks like in this role — yet.' },
      c2: { yes: 'You’ve given them the coaching and tools they need.', notFully: 'You haven’t given them the coaching and tools they need — yet.' },
      c3: { yes: 'You’ve addressed the underperformance directly.', notFully: 'You haven’t addressed this directly — yet.' }
    },
    questions: {
      q1: { yes: 'You said they’d be blindsided if you let them go.', no: 'You said they would not be blindsided — the work has been done.', notSure: 'You’re not sure if they’d be blindsided.' },
      q2: { clarity: 'You’re evaluating this from a place of clarity.', frustration: 'You said you’re evaluating this from frustration, not clarity.', mixed: 'You’re evaluating this from a mixed place — some clarity, some frustration.' },
      q3: { yes: 'You’ve documented the expectations, coaching, and corrections.', partially: 'Your documentation is only partial.', no: 'You haven’t documented this.' },
      q4: { capability: 'This is a capability problem — the skill is coachable.', will: 'This is a will problem — they know how and won’t.', both: 'You’re not sure if it’s capability or will.' },
      q5: { yes: 'You’d enthusiastically hire this person again today.', hesitant: 'You’re hesitant — you wouldn’t enthusiastically hire them again.', no: 'You would not hire this person again, knowing what you know now.' },
      q6: { lifts: 'This person lifts the team around them.', neutral: 'This person’s effect on the team is neutral.', drains: 'You said the whole team feels the drain.' },
      q7: { yes: 'You see a different seat where they’d genuinely thrive.', maybe: 'There may be a different seat where they’d thrive.', no: 'There’s no better seat for them.' },
      q8: { yes: 'You believe letting them go is the best move for the business, the team, and for them.', no: 'You don’t believe letting them go is the best move for everyone.', notSure: 'You’re not sure if letting them go is the best move.' },
      q9: { yesCan: 'You’ve counted the real cost of replacing them, and you can find someone better.', yesUnsure: 'You’ve counted the cost, but you’re unsure you can find someone better.', haventCounted: 'You haven’t counted the real cost of replacing them yet.' }
    }
  };

  var state = null;

  function showConfirm(message, onConfirm) {
    var overlay = document.getElementById('modal-overlay');
    overlay.querySelector('p').textContent = message;
    overlay.classList.remove('hidden');
    var yesBtn = document.getElementById('modal-yes');
    var noBtn = document.getElementById('modal-no');
    function cleanup() {
      overlay.classList.add('hidden');
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
    }
    function onYes() { cleanup(); onConfirm(); }
    function onNo() { cleanup(); }
    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
  }

  function freshState() {
    return {
      version: 1,
      startedAt: new Date().toISOString(),
      checks: { c1: null, c2: null, c3: null },
      questions: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null, q8: null, q9: null },
      screen: 'hero',
      seenResult: false
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function hasAnyAnswers(s) {
    var anyCheck = Object.keys(s.checks).some(function (k) { return s.checks[k] !== null; });
    var anyQ = Object.keys(s.questions).some(function (k) { return s.questions[k] !== null; });
    return anyCheck || anyQ;
  }

  function allChecksAnswered(s) { return Object.keys(s.checks).every(function (k) { return s.checks[k] !== null; }); }
  function allQuestionsAnswered(s) { return Object.keys(s.questions).every(function (k) { return s.questions[k] !== null; }); }

  /* ---------- screen management ---------- */

  var SCREENS = ['hero', 'checks', 'questions', 'synthesis', 'result'];

  function showScreen(name) {
    state.screen = name;
    save();
    document.querySelector('.hero').classList.toggle('hidden', name !== 'hero');
    SCREENS.slice(1).forEach(function (s) {
      var el = document.getElementById('step-' + s);
      if (el) el.classList.toggle('show', s === name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- progress ---------- */

  function updateProgress() {
    var answered = Object.keys(state.checks).filter(function (k) { return state.checks[k] !== null; }).length +
      Object.keys(state.questions).filter(function (k) { return state.questions[k] !== null; }).length;
    document.getElementById('pcount').textContent = answered + '/12';
    document.getElementById('pbar-fill').style.width = Math.round((answered / 12) * 100) + '%';
  }

  /* ---------- checks ---------- */

  function renderChecks() {
    var host = document.getElementById('checks-host');
    host.innerHTML = '';
    C.checks.forEach(function (item, i) {
      var card = document.createElement('div');
      card.className = 'card';
      card.id = 'card-' + item.id;
      card.innerHTML =
        '<div class="ctop">' +
          '<div class="cn">' + (i + 1) + '</div>' +
          '<div>' +
            '<div class="ctitle">' + item.title + '</div>' +
            '<div class="cbody">' + item.body + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="opts">' + item.options.map(function (o) {
          return '<button type="button" class="opt" data-val="' + o.v + '">' + o.label + '</button>';
        }).join('') + '</div>' +
        '<div class="coach" id="coach-' + item.id + '">' +
          '<div class="ct">If not fully</div>' +
          '<div class="cttl">' + item.coachTitle + '</div>' +
          '<p>' + item.coach + '</p>' +
        '</div>';
      host.appendChild(card);

      card.querySelectorAll('.opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.checks[item.id] = btn.getAttribute('data-val');
          card.classList.add('answered');
          card.querySelectorAll('.opt').forEach(function (b) { b.classList.toggle('sel', b === btn); });
          document.getElementById('coach-' + item.id).classList.toggle('show', btn.getAttribute('data-val') === 'notFully');
          updateProgress();
          updateChecksGateAndContinue();
          save();
        });
      });
    });
  }

  function updateChecksGateAndContinue() {
    var anyNotFully = Object.keys(state.checks).some(function (k) { return state.checks[k] === 'notFully'; });
    document.getElementById('gatebar').classList.toggle('show', anyNotFully);
    document.getElementById('checks-continue').classList.toggle('show', allChecksAnswered(state));
  }

  /* ---------- questions ---------- */

  function renderQuestions() {
    var host = document.getElementById('questions-host');
    host.innerHTML = '';
    C.questions.forEach(function (item, i) {
      var card = document.createElement('div');
      card.className = 'card';
      card.id = 'card-' + item.id;
      var metaHtml = item.meta ? '<div class="cmeta">' + item.meta + '</div>' : '';
      var branchHtml = '';
      if (item.branch) {
        branchHtml =
          '<div class="coach" id="coach-' + item.id + '">' +
            '<div class="ct">Coaching note</div>' +
            '<div class="cttl">' + item.branch.title + '</div>' +
            '<p>' + item.branch.body + '</p>' +
            (item.branch.pause ? '<div class="pausebtn"><button type="button" class="btn btn-ghost" id="pause-' + item.id + '">Pause &amp; resume tomorrow</button><div class="inline-note" id="pausenote-' + item.id + '">Saved. Come back whenever you’re ready — your answers will be right where you left them.</div></div>' : '') +
          '</div>';
      }
      card.innerHTML =
        '<div class="ctop">' +
          '<div class="cn">' + (i + 1) + '</div>' +
          '<div>' +
            '<div class="ctitle">' + item.title + '</div>' +
            metaHtml +
          '</div>' +
        '</div>' +
        '<div class="opts">' + item.options.map(function (o) {
          return '<button type="button" class="opt" data-val="' + o.v + '">' + o.label + '</button>';
        }).join('') + '</div>' +
        branchHtml;
      host.appendChild(card);

      card.querySelectorAll('.opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var val = btn.getAttribute('data-val');
          state.questions[item.id] = val;
          card.classList.add('answered');
          card.querySelectorAll('.opt').forEach(function (b) { b.classList.toggle('sel', b === btn); });
          if (item.branch) {
            var onVals = Array.isArray(item.branch.on) ? item.branch.on : [item.branch.on];
            document.getElementById('coach-' + item.id).classList.toggle('show', onVals.indexOf(val) !== -1);
          }
          updateProgress();
          document.getElementById('questions-continue').classList.toggle('show', allQuestionsAnswered(state));
          save();
        });
      });

      if (item.branch && item.branch.pause) {
        var pauseBtn = card.querySelector('#pause-' + item.id);
        var pauseNote = card.querySelector('#pausenote-' + item.id);
        if (pauseBtn) {
          pauseBtn.addEventListener('click', function () {
            save();
            pauseNote.classList.add('show');
          });
        }
      }
    });
  }

  /* ---------- synthesis ---------- */

  function renderSynthesis() {
    var list = document.getElementById('mirror-list');
    list.innerHTML = '';
    Object.keys(state.checks).forEach(function (k) {
      var v = state.checks[k];
      if (v && v !== 'yes') {
        var li = document.createElement('li');
        li.innerHTML = MIRROR.checks[k][v];
        list.appendChild(li);
      }
    });
    C.questions.forEach(function (item) {
      var v = state.questions[item.id];
      var li = document.createElement('li');
      li.innerHTML = MIRROR.questions[item.id][v];
      list.appendChild(li);
    });
  }

  /* ---------- result ---------- */

  function renderResult() {
    var decision = window.LOGIC.decide(state.checks, state.questions);
    state.__docsGuard = decision.flags.docsGuard;
    var pathInfo = C.paths[decision.path];
    var hero = document.getElementById('result-hero');
    hero.innerHTML =
      '<div class="rk">' + pathInfo.resultKick + '</div>' +
      '<div class="rt">' + pathInfo.headline + '</div>' +
      '<div class="rb">' + pathInfo.because + '</div>' +
      (decision.exitDamped ? '<div class="rdamp">You flagged frustration on Q2 — revisit this after the reset. Treat Exit as a decision to review, not a same-day action.</div>' : '');

    var rwhy = document.getElementById('rwhy-list');
    rwhy.innerHTML = '';
    decision.drivers.forEach(function (id) {
      var text = MIRROR.checks[id] ? MIRROR.checks[id][state.checks[id]] : MIRROR.questions[id][state.questions[id]];
      var li = document.createElement('li');
      li.innerHTML = text;
      rwhy.appendChild(li);
    });

    var pb = C.playbooks[decision.path];
    var stepsHtml = pb.steps
      .filter(function (s) { return !(s.docsOnly && !state.__docsGuard); })
      .map(function (s) {
        var bodyClass = s.quote ? 'pb quote' : 'pb';
        return '<div class="pstep">' +
          '<div class="pn">' + s.n + '</div>' +
          '<div><div class="pttl">' + s.t + '</div><div class="' + bodyClass + '">' + s.b + '</div>' +
          (s.docsOnly ? '<span class="docflag">Required — documentation gap flagged</span>' : '') +
          '</div></div>';
      }).join('');
    document.getElementById('playbook-host').innerHTML = '<div class="pt">' + pb.title + '</div>' + stepsHtml;

    // matched phrases + expandable toolkit
    var matchedNums = C.matchedPhrasesByPath[decision.path] || [];
    var matched = C.phrases.filter(function (p) { return matchedNums.indexOf(p.n) !== -1; });
    var rest = C.phrases.filter(function (p) { return matchedNums.indexOf(p.n) === -1; });
    function phraseCard(p) {
      return '<div class="phrase"><div class="pn2">' + p.n + ' · ' + p.t + '</div><div class="pline">' + p.line + '</div><div class="puse">' + p.use + '</div></div>';
    }
    var phrasesHost = document.getElementById('result-phrases');
    phrasesHost.innerHTML = matched.map(phraseCard).join('') +
      '<div class="phrasetoggle"><button type="button" class="btn btn-ghost" id="btn-fulltoolkit">See the full toolkit (5 Power Phrases)</button></div>' +
      '<div id="rest-phrases" class="hidden">' + rest.map(phraseCard).join('') + '</div>';
    document.getElementById('btn-fulltoolkit').addEventListener('click', function () {
      document.getElementById('rest-phrases').classList.toggle('hidden');
    });

    var justified = document.getElementById('justified');
    if (decision.path === 'exit') {
      justified.style.display = 'block';
      justified.querySelector('p').textContent = C.justifiedNote;
    } else {
      justified.style.display = 'none';
    }

    state.seenResult = true;
    state.__decision = decision;
    save();
    return decision;
  }

  /* ---------- summary text (download / email) ---------- */

  function buildSummaryText(decision) {
    var pathInfo = C.paths[decision.path];
    var pb = C.playbooks[decision.path];
    var lines = [];
    lines.push('THE 3-9-17 FORMULA — YOUR DECISION BRIEF');
    lines.push('');
    lines.push('PATH: ' + pathInfo.label);
    lines.push(pathInfo.headline);
    lines.push(pathInfo.because);
    if (decision.exitDamped) lines.push('\nNote: frustration flagged on Q2 — revisit after the reset before treating Exit as a same-day action.');
    lines.push('');
    lines.push('BECAUSE YOU SAID:');
    decision.drivers.forEach(function (id) {
      var text = MIRROR.checks[id] ? MIRROR.checks[id][state.checks[id]] : MIRROR.questions[id][state.questions[id]];
      lines.push('- ' + text.replace(/<\/?b>/g, ''));
    });
    lines.push('');
    lines.push('YOUR PLAYBOOK — ' + pb.title);
    pb.steps.filter(function (s) { return !(s.docsOnly && !state.__docsGuard); }).forEach(function (s) {
      lines.push(s.n + '. ' + s.t + ' ' + s.b);
    });
    if (decision.path === 'exit') {
      lines.push('');
      lines.push('A NOTE ON BEING JUSTIFIED:');
      lines.push(C.justifiedNote);
    }
    lines.push('');
    lines.push('Make it a great day. — The Sellership System® · BenWard.com');
    return lines.join('\n');
  }

  /* ---------- keep it: print / pdf / download / email ---------- */

  // Attach a listener only if the element exists, so one missing button
  // can never stop the rest of the page (like saved progress) from loading.
  function on(id, evt, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
  }

  var COMPLETION_URL = 'https://university.benward.com/accountability-pilar-3/?formula3917=completed#section-2';

  function goToCompletionPage() {
    try {
      (window.top || window).location.href = COMPLETION_URL;
    } catch (e) {
      window.location.href = COMPLETION_URL;
    }
  }

  function wireKeepIt() {
    on('btn-print', 'click', function () { window.print(); });
    on('btn-pdf', 'click', function () {
      window.print();
    });
    on('btn-download', 'click', function () {
      var decision = state.__decision || window.LOGIC.decide(state.checks, state.questions);
      var text = buildSummaryText(decision);
      var blob = new Blob([text], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '3-9-17-decision-brief.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    on('btn-email', 'click', function () {
      var form = document.getElementById('emailform');
      if (form) form.classList.add('show');
    });

    on('ef-send', 'click', function () {
      var email = document.getElementById('ef-email').value.trim();
      var name = document.getElementById('ef-name').value.trim();
      var errEl = document.getElementById('ef-err');
      var sentEl = document.getElementById('ef-sent');
      errEl.classList.remove('show');
      sentEl.classList.remove('show');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = 'Enter a valid email address.';
        errEl.classList.add('show');
        return;
      }
      var decision = state.__decision || window.LOGIC.decide(state.checks, state.questions);
      var sendBtn = document.getElementById('ef-send');
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending…';
      fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          path: decision.path,
          summary: buildSummaryText(decision)
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('send failed');
        return r.json();
      }).then(function () {
        sentEl.textContent = 'Sent to ' + email + '. Check your inbox.';
        sentEl.classList.add('show');
        sendBtn.textContent = 'Sent';
        // Only move on to the next lesson after the email actually went out.
        setTimeout(goToCompletionPage, 1500);
      }).catch(function () {
        errEl.textContent = 'Something went wrong sending that. Try again in a moment.';
        errEl.classList.add('show');
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send it to me';
      });
    });
  }

  /* ---------- nav wiring ---------- */

  function wireNav() {
    document.getElementById('btn-start').addEventListener('click', function () {
      showScreen('checks');
    });
    document.getElementById('btn-to-questions').addEventListener('click', function () {
      showScreen('questions');
    });
    document.getElementById('btn-to-synthesis').addEventListener('click', function () {
      renderSynthesis();
      showScreen('synthesis');
    });
    document.getElementById('btn-reveal').addEventListener('click', function () {
      renderResult();
      showScreen('result');
    });
    document.getElementById('btn-startover').addEventListener('click', function () {
      showConfirm('Start over with someone else? This clears your current answers.', function () {
        localStorage.removeItem(STORAGE_KEY);
        state = freshState();
        renderChecks();
        renderQuestions();
        updateProgress();
        updateChecksGateAndContinue();
        document.getElementById('questions-continue').classList.remove('show');
        document.getElementById('emailform').classList.remove('show');
        showScreen('hero');
      });
    });
  }

  /* ---------- resume ---------- */

  function wireResume() {
    var saved = load();
    var resumeBanner = document.getElementById('resume');
    if (saved && hasAnyAnswers(saved) && !(saved.seenResult)) {
      resumeBanner.classList.add('show');
      document.getElementById('btn-resume').addEventListener('click', function () {
        state = saved;
        applyStateToUI();
        resumeBanner.classList.remove('show');
        var target = allQuestionsAnswered(state) ? 'synthesis' : (allChecksAnswered(state) ? 'questions' : 'checks');
        showScreen(target);
      });
      document.getElementById('btn-fresh').addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY);
        state = freshState();
        applyStateToUI();
        resumeBanner.classList.remove('show');
      });
    }
  }

  function applyStateToUI() {
    renderChecks();
    renderQuestions();
    // reflect saved selections
    Object.keys(state.checks).forEach(function (k) {
      var v = state.checks[k];
      if (!v) return;
      var card = document.getElementById('card-' + k);
      card.classList.add('answered');
      card.querySelectorAll('.opt').forEach(function (b) { b.classList.toggle('sel', b.getAttribute('data-val') === v); });
      if (v === 'notFully') document.getElementById('coach-' + k).classList.add('show');
    });
    C.questions.forEach(function (item) {
      var v = state.questions[item.id];
      if (!v) return;
      var card = document.getElementById('card-' + item.id);
      card.classList.add('answered');
      card.querySelectorAll('.opt').forEach(function (b) { b.classList.toggle('sel', b.getAttribute('data-val') === v); });
      if (item.branch) {
        var onVals = Array.isArray(item.branch.on) ? item.branch.on : [item.branch.on];
        if (onVals.indexOf(v) !== -1) document.getElementById('coach-' + item.id).classList.add('show');
      }
    });
    updateProgress();
    updateChecksGateAndContinue();
    document.getElementById('questions-continue').classList.toggle('show', allQuestionsAnswered(state));
  }

  /* ---------- init ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    state = freshState();
    renderChecks();
    renderQuestions();
    updateProgress();
    wireNav();
    wireKeepIt();
    wireResume();
  });
})();
