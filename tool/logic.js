/* The 3-9-17 Formula — decision logic
   Implements the weight map + override rules from Blueprint §05. */

window.LOGIC = (function () {

  function scoreAnswers(checks, q) {
    var s = { leadFirst: 0, develop: 0, reposition: 0, exit: 0 };
    var flags = { frustrationPause: false, docsGuard: false, anyCheckNotFully: false };

    ['c1', 'c2', 'c3'].forEach(function (c) {
      if (checks[c] === 'notFully') flags.anyCheckNotFully = true;
    });

    // Q1
    if (q.q1 === 'yes') s.leadFirst += 2;
    else if (q.q1 === 'no') s.exit += 1;
    else if (q.q1 === 'notSure') s.leadFirst += 1;

    // Q2
    if (q.q2 === 'frustration') { s.leadFirst += 2; flags.frustrationPause = true; }
    else if (q.q2 === 'mixed') s.leadFirst += 1;

    // Q3
    if (q.q3 === 'partially') { s.leadFirst += 1; flags.docsGuard = true; }
    else if (q.q3 === 'no') { s.leadFirst += 2; flags.docsGuard = true; }

    // Q4
    if (q.q4 === 'capability') s.develop += 3;
    else if (q.q4 === 'will') s.exit += 3;
    else if (q.q4 === 'both') { s.develop += 1; s.exit += 1; }

    // Q5 (KWINK — heaviest single input)
    if (q.q5 === 'yes') s.develop += 3;
    else if (q.q5 === 'hesitant') { s.develop += 1; s.exit += 1; }
    else if (q.q5 === 'no') s.exit += 4;

    // Q6
    if (q.q6 === 'lifts') s.develop += 2;
    else if (q.q6 === 'drains') s.exit += 2;

    // Q7
    if (q.q7 === 'yes') s.reposition += 4;
    else if (q.q7 === 'maybe') s.reposition += 2;

    // Q8
    if (q.q8 === 'yes') s.exit += 3;
    else if (q.q8 === 'no') s.develop += 2;

    // Q9
    if (q.q9 === 'yesCan') s.exit += 2;
    else if (q.q9 === 'yesUnsure') s.exit += 1;
    else if (q.q9 === 'haventCounted') s.leadFirst += 1;

    // R5 · Honest reposition — a will problem travels with the person
    if ((q.q7 === 'yes' || q.q7 === 'maybe') && q.q4 === 'will') {
      s.reposition = 0;
      s.exit += 3;
    }

    return { scores: s, flags: flags };
  }

  function driversFor(path, checks, q) {
    var d = [];
    if (path === 'leadFirst') {
      ['c1', 'c2', 'c3'].forEach(function (c) { if (checks[c] === 'notFully') d.push(c); });
      if (q.q2 === 'frustration') d.push('q2');
      if (q.q1 === 'yes' || q.q1 === 'notSure') d.push('q1');
      if (q.q9 === 'haventCounted') d.push('q9');
    } else if (path === 'develop') {
      if (q.q4 === 'capability') d.push('q4');
      if (q.q5 === 'yes' || q.q5 === 'hesitant') d.push('q5');
      if (q.q6 === 'lifts') d.push('q6');
      if (q.q8 === 'no') d.push('q8');
    } else if (path === 'reposition') {
      if (q.q7 === 'yes' || q.q7 === 'maybe') d.push('q7');
    } else if (path === 'exit') {
      if (q.q4 === 'will') d.push('q4');
      if (q.q5 === 'no') d.push('q5');
      if (q.q6 === 'drains') d.push('q6');
      if (q.q8 === 'yes') d.push('q8');
      if (q.q9 === 'yesCan' || q.q9 === 'yesUnsure') d.push('q9');
    }
    return d;
  }

  var IRREVERSIBILITY = { develop: 0, reposition: 1, exit: 2, leadFirst: -1 };

  function decide(checks, q) {
    var res = scoreAnswers(checks, q);
    var scores = res.scores, flags = res.flags;

    var path;
    // R1 · Lead First override
    if (flags.anyCheckNotFully) {
      path = 'leadFirst';
    } else {
      var keys = Object.keys(scores);
      path = keys.reduce(function (best, k) {
        if (scores[k] > scores[best]) return k;
        if (scores[k] === scores[best] && IRREVERSIBILITY[k] < IRREVERSIBILITY[best]) return k;
        return best;
      }, keys[0]);
    }

    // R2 · Frustration damper — Exit can only be "revisit after the reset"
    var exitDamped = (path === 'exit' && flags.frustrationPause);

    return {
      path: path,
      scores: scores,
      flags: flags,
      exitDamped: exitDamped,
      drivers: driversFor(path, checks, q)
    };
  }

  return { decide: decide, scoreAnswers: scoreAnswers };
})();
