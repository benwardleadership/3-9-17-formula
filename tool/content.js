/* The 3-9-17 Formula — content
   Source of truth: "3-9-17 Blueprint.html" (Product Experience Blueprint).
   All copy below is transcribed verbatim from the blueprint spec. */

window.CONTENT = {

  checks: [
    {
      id: 'c1',
      title: 'Expectations.',
      body: 'Do I genuinely understand what good performance looks like in this role, and have I set crystal clear expectations for it?',
      coachTitle: 'The Expectations Reset',
      coach: 'Write the top 3 outcomes this role must deliver, with numbers. Book a 20-minute conversation this week: "I want to make sure I’ve been clear about what winning looks like." Reset the standard face to face — clarity is a gift, and it’s yours to give first.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'notFully', label: 'Not fully' } ]
    },
    {
      id: 'c2',
      title: 'Teaching.',
      body: 'Have I given them the tools, coaching, and clarity they need to succeed?',
      coachTitle: 'The Teaching Cadence',
      coach: 'Commit to a 30-day coaching rhythm: one ride-along or call review per week, one skill in focus at a time, one written recap after each session. Teach the skill, watch them use it, praise the attempt. Then re-evaluate with real evidence.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'notFully', label: 'Not fully' } ]
    },
    {
      id: 'c3',
      title: 'Correction.',
      body: 'Have I addressed the underperformance directly?',
      coachTitle: 'The Correction Conversation',
      coach: 'Direct and warm can coexist. Structure: name the specific gap (facts, not feelings) → state the standard → ask their read → agree on the fix and the date you’ll review it. What you tolerate, you endorse — this conversation is the tolerance ending.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'notFully', label: 'Not fully' } ]
    }
  ],

  gate: {
    title: 'The work may be yours first',
    body: 'One or more checks isn’t a clear yes. You can keep going, but your final path will start with the leadership work, and your answers below will feed the plan.'
  },

  questions: [
    {
      id: 'q1',
      title: 'Will this person be blindsided if I let them go?',
      meta: 'Blindsided = the correction work hasn’t happened.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'notSure', label: 'Not sure' } ]
    },
    {
      id: 'q2',
      title: 'Am I evaluating this from a place of clarity, or from a place of frustration?',
      options: [ { v: 'clarity', label: 'Clarity' }, { v: 'frustration', label: 'Frustration' }, { v: 'mixed', label: 'Mixed' } ],
      branch: {
        on: 'frustration',
        title: 'The Reset',
        body: 'Don’t decide hot. Write two columns: facts (observable, dated) vs. feelings. Sleep on it once.',
        pause: true
      }
    },
    {
      id: 'q3',
      title: 'Have I documented the expectations I set, the coaching I gave, and the corrections I delivered?',
      meta: 'Protects the person, the leader, and the business.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'partially', label: 'Partially' }, { v: 'no', label: 'No' } ]
    },
    {
      id: 'q4',
      title: 'Is this a capability problem or a will problem?',
      options: [ { v: 'capability', label: 'Capability' }, { v: 'will', label: 'Will' }, { v: 'both', label: 'Both / not sure' } ],
      branch: {
        on: 'both',
        title: 'The test',
        body: 'If their life depended on doing it tomorrow, could they? Yes = will problem. Capability: they’re trying and missing — skills are coachable. Will: they know how and won’t — attitude is a choice.'
      }
    },
    {
      id: 'q5',
      title: 'Would I enthusiastically hire this person again today, knowing what I now know?',
      meta: 'KWINK thinking — the single heaviest input in the model.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'hesitant', label: 'Hesitant' }, { v: 'no', label: 'No' } ]
    },
    {
      id: 'q6',
      title: 'How is this person affecting the team around them?',
      meta: 'What you tolerate, you endorse — the team is watching the standard.',
      options: [ { v: 'lifts', label: 'Lifts it' }, { v: 'neutral', label: 'Neutral' }, { v: 'drains', label: 'Drains it' } ]
    },
    {
      id: 'q7',
      title: 'Is there a different seat where this person would genuinely thrive?',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'maybe', label: 'Maybe' }, { v: 'no', label: 'No' } ],
      branch: {
        on: ['yes', 'maybe'],
        title: 'The Reposition Test',
        body: 'Would the other team enthusiastically take them, knowing everything? If you’d have to sell or hide the history, it’s not a reposition — it’s passing a problem. A true reposition is a strengths match, agreed openly with the receiving leader.'
      }
    },
    {
      id: 'q8',
      title: 'Is letting them go the best move for the business, the team, and for this person?',
      meta: 'All three, not two of three. Staying stuck in the wrong seat isn’t kindness.',
      options: [ { v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'notSure', label: 'Not sure' } ]
    },
    {
      id: 'q9',
      title: 'Have I counted the real cost of replacing them — and can I find someone better?',
      meta: 'Ramp time, pipeline risk, team load. Cost is real; so is the cost of keeping the wrong person.',
      options: [ { v: 'yesCan', label: 'Yes, and I can' }, { v: 'yesUnsure', label: 'Yes, but unsure' }, { v: 'haventCounted', label: 'Haven’t counted' } ]
    }
  ],

  paths: {
    leadFirst: {
      label: 'Lead First',
      headline: 'Your answers point to the leadership work first',
      because: 'The gap may be yours before it’s theirs.',
      resultKick: 'The work may be yours first'
    },
    develop: {
      label: 'Develop',
      headline: 'Your answers point to Develop',
      because: 'This person is worth the investment — a capability gap with willingness intact.',
      resultKick: 'Right person, coachable gap'
    },
    reposition: {
      label: 'Reposition',
      headline: 'Your answers point to Reposition',
      because: 'Right person, wrong seat.',
      resultKick: 'Right person, wrong seat'
    },
    exit: {
      label: 'Exit',
      headline: 'Your answers point to Exit',
      because: 'The answers point to a change.',
      resultKick: 'Fire fast, respectfully'
    }
  },

  playbooks: {
    leadFirst: {
      title: 'Lead First — the 30-day leadership sprint',
      steps: [
        { n: 'W1', t: 'Reset the standard.', b: 'The Expectations conversation: top 3 outcomes, with numbers, agreed face to face. End with: "Is there anything unclear about what winning looks like?"' },
        { n: 'W2', t: 'Teach one thing.', b: 'Pick the single highest-leverage skill gap. Demonstrate it, watch them try it, debrief the same day.' },
        { n: 'W3', t: 'Correct in real time.', b: 'First miss after the reset gets addressed within 24 hours — small, specific, warm.' },
        { n: 'W4', t: 'Review with evidence.', b: 'Score the month against the 3 outcomes. Then return to the tool — the Checks will pass honestly, and the Nine will mean something.' }
      ]
    },
    develop: {
      title: 'Develop — the 30-day development plan outline',
      steps: [
        { n: '1', t: 'Name the gap together.', b: 'One sentence, agreed: "The gap is X, and closing it looks like Y by [date]."' },
        { n: '2', t: 'One skill at a time.', b: 'Weekly focus, weekly evidence (call recording, ride-along, pipeline review). Praise attempts loudly, correct misses quickly.' },
        { n: '3', t: 'Checkpoints at day 10 / 20 / 30.', b: 'Each checkpoint: on track / off track, said out loud. No surprises at day 30.' },
        { n: '4', t: 'Day 30: re-run the 3-9-17.', b: 'If the answers moved, keep investing. If nothing moved with full effort on both sides — the formula has answered the question.' }
      ]
    },
    reposition: {
      title: 'Reposition — right person, wrong seat',
      steps: [
        { n: '1', t: 'Strengths first.', b: 'Name what they’re genuinely great at — with evidence. If you can’t, this isn’t a reposition.' },
        { n: '2', t: 'Full-disclosure handoff.', b: 'The receiving leader hears everything — the gaps, the history, the coaching given. They choose enthusiastically or not at all.' },
        { n: '3', t: 'The honest conversation.', b: '"You have real strengths this seat doesn’t use. I’d rather move you to where you can win than watch you struggle here." Framed as a bet on them, with a clear standard in the new seat.' },
        { n: '4', t: '30-day check in the new seat.', b: 'Same standard-setting as any new hire. A reposition without a reset is a delay, not a solution.' }
      ]
    },
    exit: {
      title: 'Exit — fire fast, respectfully',
      steps: [
        { n: '1', t: 'Document first.', b: 'Dates, expectations set, coaching given, corrections delivered. Then proceed.', docsOnly: true },
        { n: '2', t: 'Consult HR / employment counsel.', b: 'For your industry and state, before the conversation. Non-negotiable step.' },
        { n: '3', t: 'The 17 Words:', b: '“I’m concerned about your performance. We need to make a change. I’m going to let you go.” Short, direct, humane. No debate, no re-litigating — the decision is made before the meeting.', quote: true },
        { n: '4', t: 'The longer script.', b: 'commitment → impact → help given → change needed → respect. Same structure as the print piece.' },
        { n: '5', t: 'After:', b: 'Tell the team the standard, not the story. Protect the person’s dignity; reinforce what the team can count on.' }
      ]
    }
  },

  justifiedNote: 'A leader doesn’t need to be perfect to be justified in terminating someone. If the person has had sufficient chance, sufficient effort has been made to develop them, and they are still hurting the team’s results and culture, action cannot be procrastinated.',

  phrases: [
    { n: 1, t: 'Own.', line: '"If I’ve been unclear, that’s on me. Let me be more clear."', use: 'Use when expectations were vague. Owns the communication before addressing the performance.', matchTo: ['c1'] },
    { n: 2, t: 'Listen.', line: '"I could be wrong. I often am. Help me understand what I’m missing."', use: 'Use when you need more context. Leads with humility instead of accusation.', matchTo: ['q2-frustration', 'correction'] },
    { n: 3, t: 'Open.', line: '"Do I have your permission to challenge you?"', use: 'Use when the conversation needs to get more direct. Prepares the person to receive truth without feeling attacked.', matchTo: ['c3', 'will'] },
    { n: 4, t: 'Call up.', line: '"I believe you’re capable of more than what I’m seeing right now."', use: 'Use when you need to raise the standard. Communicates belief before truth, so the truth can be heard.', matchTo: ['develop'] },
    { n: 5, t: 'Clarify.', line: '"Here’s what I’m seeing, here’s the impact, and it can’t continue."', use: 'Use when you need to name the real issue. Separates the behavior from the person and makes the line clear.', matchTo: ['c3', 'exit'] }
  ],

  // matched phrase numbers per path, in priority order
  matchedPhrasesByPath: {
    leadFirst: [1, 4, 2],
    develop: [4, 2],
    reposition: [4, 2],
    exit: [5, 3]
  }
};
