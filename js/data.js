/* ============================================================
   THE LITTLE THINGS — story, world, and dialogue
   Canon is fixed here. Characters remember through state.
   ============================================================ */
(function () {
  const LT = (window.LT = window.LT || {});
  const D = (LT.data = {});

  D.title = 'The Little Things';
  D.town = 'Harrowmere';

  /* ------------------------------------------------------------
     People
     ------------------------------------------------------------ */
  D.characters = {
    mara: {
      id: 'mara',
      name: 'Mara Voss',
      role: 'Granddaughter',
      portrait: 'mara',
      color: '#c99a5b',
      short: 'Elias’s granddaughter. Curious, warm, and trying not to hope too loudly.',
      journal:
        'Elias Voss’s granddaughter. She found the watch in his desk, wrapped in a handkerchief. She wants the truth more than she wants the watch.',
      notes: {
        mara_account:
          'Elias ran the post office on Chapel Lane for forty years. Quiet. Crosswords. Tinned peaches. He never spoke about before Mara was born.',
        photo_faces:
          'Mara had never seen the photograph before. She held it by the corners, as if it might come apart.',
      },
    },
    june: {
      id: 'june',
      name: 'June Halley',
      role: 'Retired station clerk',
      portrait: 'june',
      color: '#7e96a0',
      short: 'Thirty-one years behind the ticket window. Sharp as a pin, soft as a brick.',
      journal:
        'June Halley. Retired from Harrowmere Station after thirty-one years. She sits on the platform most evenings, with a thermos and no particular train to wait for.',
      notes: {
        june_account:
          'She waited on platform two until the station clock said twenty to nine. Then she went home, made tea, and went to work the next day.',
        photo_faces:
          'June remembered the coat before she remembered the photograph. “I saved for months for that coat.”',
        letter_reason:
          'June did not read the letter in front of you. She read it twice, folded it, and looked at the rain for a while.',
      },
    },
    theo: {
      id: 'theo',
      name: 'Theo Marchetti',
      role: 'Clock repairer',
      portrait: 'theo',
      color: '#b07a4e',
      short: 'Clocks, music boxes, the occasional stubborn toaster. Speaks in mechanisms.',
      journal:
        'Theo Marchetti. Runs Marchetti & Son, though there is no son. His father kept the repair ledger and believed every clock deserved a second chance.',
      notes: {
        theo_observation:
          '“The hands are set, not fallen. Someone stopped it on purpose — and then kept it clean for sixty years. That’s not neglect. That’s a decision.”',
        ledger_entry:
          'Theo’s father serviced the watch for decades. The instruction never changed: clean and oil, do not reset hands.',
      },
    },
    wren: {
      id: 'wren',
      name: 'Wren Alder',
      role: 'The neighbour',
      portrait: 'wren',
      color: '#8e9a5e',
      short: 'Flowers, gossip, and an unexpected archive. Knows everyone’s business as a public service.',
      journal:
        'Wren Alder. Runs the flower cart on Chapel Lane and considers the town’s business a form of civic maintenance. She took a box from the Voss house clearance and never found a home for it.',
      notes: {
        wren_observation:
          '“Elias Voss. Post office. He used to frank my seed orders and pretend he hadn’t read the catalogues. Lovely man. Sad eyes.”',
      },
    },
    elias: {
      id: 'elias',
      name: 'Elias Voss',
      role: 'Mara’s grandfather',
      portrait: 'elias',
      color: '#8d7a5f',
      short: 'Postmaster. Quiet. Kept a stopped watch for sixty years.',
      journal:
        'Elias Voss, 1943–2025. Postmaster on Chapel Lane. In September 1962 he planned to leave Harrowmere on the 8:17 train with June Halley. He did not go.',
      notes: {
        photo_faces:
          'Elias is trying not to smile. June isn’t trying at all. They are standing outside this station in the autumn of 1962.',
        letter_reason:
          'His father was ill. Elias could not leave him, and could not ask June to stay. He wrote the letter and never sent it.',
      },
    },
  };

  /* ------------------------------------------------------------
     Clues / evidence
     ------------------------------------------------------------ */
  D.clues = {
    watch_face: {
      title: 'Eight seventeen',
      object: 'watch',
      card: 'watch',
      source: 'The watch',
      text:
        'The second hand is stopped between 8:17 and 8:18. The glass is unscratched. Someone kept this watch clean long after it stopped.',
    },
    watch_engraving: {
      title: '“For June. 8:17. E.”',
      object: 'watch',
      card: 'watch',
      source: 'The watch, on the back',
      text:
        'The letters are uneven, hand-cut. The same hand that wore the watch made sure the message would sit against a wrist. June. 8:17. E.',
    },
    watch_seam: {
      title: 'A seam in the case',
      object: 'watch',
      card: 'watch',
      source: 'The watch, along the rim',
      text:
        'A hairline seam runs around the back of the case, finer than a repair line. A hidden compartment, perhaps. It needs a proper tool — and someone who knows old brass.',
    },
    mara_account: {
      title: 'Mara’s account',
      object: 'photo',
      card: 'june',
      source: 'Mara Voss',
      text:
        'Elias Voss ran the post office on Chapel Lane for forty years. He liked crosswords and tinned peaches. He never spoke about before Mara was born. The watch was wrapped in a handkerchief in his desk.',
    },
    photo_faces: {
      title: 'Elias & June, 1962',
      object: 'photo',
      card: 'photo',
      source: 'The photograph, front',
      text:
        'Elias Voss and June Halley outside Harrowmere Station, autumn 1962. He is trying not to smile. She isn’t trying at all. Someone has written a date on the back in pencil.',
    },
    photo_back: {
      title: '“Don’t be late. J.”',
      object: 'photo',
      card: 'photo',
      source: 'The photograph, back',
      text:
        '“The 8:17 — don’t be late. J. Sept ’62.” The corner is worn soft, as if the photograph lived in a pocket for a long time.',
    },
    timetable_817: {
      title: 'The 8:17 to Ashcombe',
      object: 'timetable',
      card: 'timetable',
      source: 'The station timetable',
      text:
        'The 8:17 evening service to Ashcombe, platform two. A red pen has been drawn under it, twice. The ink has faded to the colour of old brick.',
    },
    timetable_last: {
      title: 'The last run',
      object: 'timetable',
      card: 'timetable',
      source: 'The station timetable, footer',
      text:
        'The 8:17 ran for the last time in October 1963. The line closed the following spring. The timetable stayed on the wall.',
    },
    timetable_note: {
      title: 'A note in the margin',
      object: 'timetable',
      card: 'timetable',
      source: 'The station timetable, margin',
      text:
        'In the margin, in blue biro: “E.V. — platform 2. Don’t let him forget.” The handwriting is young and certain.',
    },
    bench_carving: {
      title: 'E + J, 1962',
      object: 'bench',
      card: 'bench',
      source: 'The old bench',
      text:
        'Cut into the bench, small and careful: E + J, 1962. Someone has rubbed the letters smooth over the years. Not erased. Just touched.',
    },
    ticket_punch: {
      title: 'A platform ticket',
      object: 'ticket',
      card: 'ticket',
      source: 'June’s tin of useless things',
      text:
        'A platform ticket, punched at the edge. Harrowmere, platform two. It was used once and kept for sixty years.',
    },
    ticket_date: {
      title: '14 September 1962',
      object: 'ticket',
      card: 'ticket',
      source: 'The platform ticket',
      text:
        'The date of the evening June Halley waited for the 8:17. She waited until the station clock said twenty to nine.',
    },
    letter_opening: {
      title: '“Dear June…”',
      object: 'letter',
      card: 'letter',
      source: 'The letter inside the watch',
      text:
        '“Dear June. I have started this letter eleven times.” The paper is thin, folded small enough to fit inside a watch case. It has been in the dark for sixty years.',
    },
    letter_reason: {
      title: 'The bridge',
      object: 'letter',
      card: 'letter',
      source: 'The letter',
      text:
        '“My father is ill. The doctor says weeks, then says months, then stops saying anything at all. I could not leave him, and I could not ask you to stay. I got as far as the bridge and turned back.”',
    },
    letter_signature: {
      title: 'Signed, Elias',
      object: 'letter',
      card: 'letter',
      source: 'The letter',
      text:
        '“I heard the 8:17 go. I am sorry I was not braver. I will not send this. I think you will hate me less if I am only a person who didn’t come.” It is signed Elias. The ink is steady.',
    },
    letter_flower: {
      title: 'A pressed cornflower',
      object: 'letter',
      card: 'letter',
      source: 'Folded inside the letter',
      text:
        'A cornflower, pressed flat between the folds. Blue as a September evening. It has been waiting in the dark, patient as a stopped watch.',
    },
    ledger_entry: {
      title: '“Do not reset hands”',
      object: 'ledger',
      card: 'ledger',
      source: 'Marchetti & Son repair ledger',
      text:
        '“E. Voss — clean and oil. Do not reset hands.” Repeated every few years from 1963 to 1989, in two different hands. Elias kept the watch, and kept its hour, for the rest of his life.',
    },
    ledger_margin: {
      title: 'A note in the margin',
      object: 'ledger',
      card: 'ledger',
      source: 'The repair ledger',
      text:
        'In the margin, in Theo’s father’s hand: “Says it keeps good time. It doesn’t. He pays anyway.”',
    },
    june_account: {
      title: 'June’s side',
      object: 'ticket',
      card: 'june',
      source: 'June Halley',
      text:
        'She waited on platform two until twenty to nine. Then she went home and made tea, and the next day she went to work. “I was eighteen and proud. I thought if he wanted me, he’d come.”',
    },
    theo_observation: {
      title: 'Set, not fallen',
      object: 'watch',
      card: 'ledger',
      source: 'Theo Marchetti',
      text:
        '“The hands are set, not fallen. Someone stopped it on purpose — and then kept it clean for sixty years. That’s not neglect. That’s a decision.”',
    },
    wren_observation: {
      title: 'Wren’s recollection',
      object: 'photo',
      card: 'photo',
      source: 'Wren Alder',
      text:
        '“Elias Voss. Post office. Lovely man. Sad eyes.” Wren also remembers June as “soft as a brick,” which she insists is a compliment.',
    },
  };

  /* ------------------------------------------------------------
     Inspectable objects
     ------------------------------------------------------------ */
  D.objects = {
    watch: {
      id: 'watch',
      name: 'Brass pocket watch',
      kicker: 'Object · Finch of Harrowmere',
      item: true,
      desc:
        'A heavy brass pocket watch, warm from being held. The case is worn smooth at the edges. It has stopped at 8:17, and it has been stopped for a long time.',
      draw: 'watch',
      sides: true,
      instruction: 'Drag to turn it over · click the small warm glimmers',
      details: [
        {
          id: 'watch_face',
          label: 'The dial',
          side: 'front',
          x: 0.5,
          y: 0.52,
          r: 0.17,
          clue: 'watch_face',
          text:
            'The second hand is stopped between 8:17 and 8:18. The glass is unscratched. Someone kept this watch clean long after it stopped.',
        },
        {
          id: 'watch_crown',
          label: 'The crown',
          side: 'front',
          x: 0.5,
          y: 0.13,
          r: 0.075,
          text:
            'The winding crown turns freely. It has not been wound in a very long time. The loop above it is rubbed bright by a thumb.',
          noteId: 'watch_crown',
          note: 'The crown turns freely. It has not been wound in a long time.',
        },
        {
          id: 'watch_engraving',
          label: 'The engraving',
          side: 'back',
          x: 0.5,
          y: 0.46,
          r: 0.22,
          clue: 'watch_engraving',
          text:
            '“For June. 8:17. E.” The letters are uneven, hand-cut. The same hand that wore the watch made sure the message would sit against a wrist.',
        },
        {
          id: 'watch_seam',
          label: 'A fine seam',
          side: 'back',
          x: 0.5,
          y: 0.76,
          r: 0.12,
          clue: 'watch_seam',
          text:
            'A hairline seam runs around the back of the case, finer than a repair line. A hidden compartment, perhaps. It needs a proper tool — and someone who knows old brass.',
        },
      ],
    },
    photo: {
      id: 'photo',
      name: 'A photograph, 1962',
      kicker: 'Object · found in a house-clearance box',
      item: true,
      desc:
        'A square photograph with a white border, softened by handling. Two young people stand outside a railway station. The back is covered in pencil.',
      draw: 'photo',
      sides: true,
      instruction: 'Turn it over · click the small warm glimmers',
      details: [
        {
          id: 'photo_faces',
          label: 'The two of them',
          side: 'front',
          x: 0.42,
          y: 0.47,
          r: 0.2,
          clue: 'photo_faces',
          text:
            'Elias Voss and June Halley, outside Harrowmere Station in the autumn of 1962. He is trying not to smile. She isn’t trying at all.',
        },
        {
          id: 'photo_station',
          label: 'The station sign',
          side: 'front',
          x: 0.72,
          y: 0.25,
          r: 0.11,
          text:
            'HARROWMERE, in enamel capitals. The same sign still hangs under the canopy. The paint has gone from green to grey.',
          noteId: 'photo_station',
          note: 'The station sign in the photograph is the same one that hangs there now.',
        },
        {
          id: 'photo_back',
          label: 'The handwriting',
          side: 'back',
          x: 0.5,
          y: 0.52,
          r: 0.24,
          clue: 'photo_back',
          text:
            '“The 8:17 — don’t be late. J. Sept ’62.” The corner is worn soft, as if the photograph lived in a pocket for a long time.',
        },
      ],
    },
    timetable: {
      id: 'timetable',
      name: 'The station timetable',
      kicker: 'Object · Harrowmere Station',
      item: false,
      desc:
        'A framed timetable, sun-bleached at the edges. The evening services are printed in a narrow, confident typeface. Someone has been annotating it.',
      draw: 'timetable',
      sides: false,
      instruction: 'Click the small warm glimmers',
      details: [
        {
          id: 'timetable_817',
          label: 'The 8:17 row',
          x: 0.5,
          y: 0.47,
          r: 0.13,
          clue: 'timetable_817',
          text:
            'The 8:17 evening service to Ashcombe, platform two. A red pen has been drawn under it, twice. The ink has faded to the colour of old brick.',
        },
        {
          id: 'timetable_note',
          label: 'Blue biro',
          x: 0.77,
          y: 0.28,
          r: 0.09,
          clue: 'timetable_note',
          text:
            'In the margin: “E.V. — platform 2. Don’t let him forget.” The handwriting is young and certain.',
        },
        {
          id: 'timetable_last',
          label: 'The footer',
          x: 0.5,
          y: 0.82,
          r: 0.12,
          clue: 'timetable_last',
          text:
            'The 8:17 ran for the last time in October 1963. The line closed the following spring. The timetable stayed on the wall.',
        },
      ],
    },
    ticket: {
      id: 'ticket',
      name: 'June’s platform ticket',
      kicker: 'Object · kept in a tin with buttons',
      item: true,
      desc:
        'A small green platform ticket, soft as cloth. It has been folded and unfolded so many times that the crease has gone pale.',
      draw: 'ticket',
      sides: false,
      instruction: 'Click the small warm glimmers',
      details: [
        {
          id: 'ticket_punch',
          label: 'The punch hole',
          x: 0.24,
          y: 0.3,
          r: 0.12,
          clue: 'ticket_punch',
          text:
            'A platform ticket, punched at the edge. Harrowmere, platform two. It was used once and kept for sixty years.',
        },
        {
          id: 'ticket_date',
          label: 'The date',
          x: 0.58,
          y: 0.66,
          r: 0.13,
          clue: 'ticket_date',
          text:
            '14 September 1962. The date of the evening June Halley waited for the 8:17. She waited until the station clock said twenty to nine.',
        },
      ],
    },
    letter: {
      id: 'letter',
      name: 'The unsent letter',
      kicker: 'Object · found inside the watch case',
      item: true,
      desc:
        'One sheet of thin paper, folded down to the size of a thumbnail. The creases are soft. There is a cornflower pressed in the middle.',
      draw: 'letter',
      sides: false,
      instruction: 'Click the small warm glimmers',
      details: [
        {
          id: 'letter_opening',
          label: 'The first line',
          x: 0.5,
          y: 0.2,
          r: 0.12,
          clue: 'letter_opening',
          text:
            '“Dear June. I have started this letter eleven times.” The paper is thin, folded small enough to fit inside a watch case.',
        },
        {
          id: 'letter_flower',
          label: 'The cornflower',
          x: 0.82,
          y: 0.3,
          r: 0.09,
          clue: 'letter_flower',
          text:
            'A cornflower, pressed flat between the folds. Blue as a September evening. It has been waiting in the dark, patient as a stopped watch.',
        },
        {
          id: 'letter_reason',
          label: 'The middle',
          x: 0.5,
          y: 0.52,
          r: 0.16,
          clue: 'letter_reason',
          text:
            '“My father is ill. The doctor says weeks, then says months, then stops saying anything at all. I could not leave him, and I could not ask you to stay. I got as far as the bridge and turned back.”',
        },
        {
          id: 'letter_signature',
          label: 'The signature',
          x: 0.52,
          y: 0.82,
          r: 0.1,
          clue: 'letter_signature',
          text:
            '“I heard the 8:17 go. I am sorry I was not braver. I will not send this.” It is signed Elias. The ink is steady.',
        },
      ],
    },
    ledger: {
      id: 'ledger',
      name: 'Marchetti & Son ledger',
      kicker: 'Object · the repair ledger',
      item: false,
      desc:
        'A heavy leather ledger, swollen with age. Page after page of repairs in two different hands. The spine has been mended with tape.',
      draw: 'ledger',
      sides: false,
      instruction: 'Click the small warm glimmers',
      details: [
        {
          id: 'ledger_entry',
          label: 'E. Voss',
          x: 0.48,
          y: 0.44,
          r: 0.16,
          clue: 'ledger_entry',
          text:
            '“E. Voss — clean and oil. Do not reset hands.” Repeated every few years from 1963 to 1989, in two different hands. He kept the watch, and kept its hour, for the rest of his life.',
        },
        {
          id: 'ledger_margin',
          label: 'A margin note',
          x: 0.76,
          y: 0.65,
          r: 0.1,
          clue: 'ledger_margin',
          text:
            'In the margin: “Says it keeps good time. It doesn’t. He pays anyway.”',
        },
      ],
    },
    bluebird: {
      id: 'bluebird',
      name: 'A chipped blue bird',
      kicker: 'Object · left on the counter',
      item: true,
      desc:
        'A small ceramic bird, blue as a cornflower, with a chip out of one wing. There is a note in Wren’s handwriting: “Found on the cart. Thought of your window.”',
      draw: 'bluebird',
      sides: false,
      instruction: 'Click the small warm glimmer',
      details: [
        {
          id: 'bluebird_chip',
          label: 'The chip',
          x: 0.62,
          y: 0.44,
          r: 0.12,
          text:
            'The chip is old and smooth. Someone has glued the wing back on, badly, a long time ago. It has been loved in the way that things are loved when they are not valuable.',
          noteId: 'bluebird_chip',
          note: 'A chipped blue bird from Wren. It would look well on the windowsill.',
        },
      ],
    },
  };

  /* ------------------------------------------------------------
     Cards and connections
     ------------------------------------------------------------ */
  D.cards = {
    watch: { title: 'The stopped watch', kicker: 'Object', sub: '8:17 · “For June. 8:17. E.”' },
    photo: { title: 'Photograph, 1962', kicker: 'Object', sub: 'Elias & June, outside the station' },
    timetable: { title: 'The 8:17 timetable', kicker: 'Place', sub: 'Evening service to Ashcombe' },
    ticket: { title: 'Platform ticket', kicker: 'Object', sub: '14 September 1962' },
    letter: { title: 'The unsent letter', kicker: 'Object', sub: 'Found inside the watch case' },
    ledger: { title: 'The repair ledger', kicker: 'Place', sub: '“Do not reset hands”' },
    june: { title: 'June’s account', kicker: 'Person', sub: 'She waited until twenty to nine' },
    bench: { title: 'The bench carving', kicker: 'Place', sub: 'E + J, 1962' },
  };

  D.connections = [
    {
      id: 'd1',
      a: 'watch',
      b: 'photo',
      core: true,
      title: 'The June on the watch',
      text:
        'The name cut into the watch belongs to the girl in the photograph. June is not a stranger. She is the person Elias meant to meet.',
    },
    {
      id: 'd2',
      a: 'watch',
      b: 'timetable',
      core: true,
      title: 'The train at 8:17',
      text:
        '8:17 is not a random hour. It is the evening train to Ashcombe — the one Elias and June planned to take. The watch stopped when the train left.',
    },
    {
      id: 'd3',
      a: 'letter',
      b: 'ledger',
      core: true,
      title: 'He chose to stay',
      text:
        'The letter explains the missed train. The ledger explains the rest: Elias kept the watch, and kept its hands at 8:17, for the rest of his life. He did not stop loving her. He stopped time.',
    },
    {
      id: 'd4',
      a: 'ticket',
      b: 'photo',
      core: true,
      title: 'She waited',
      text:
        'June bought a platform ticket and stood on platform two. The photograph shows who she was waiting for. She waited until twenty to nine.',
    },
    {
      id: 'd5',
      a: 'letter',
      b: 'watch',
      core: false,
      title: 'Words he never sent',
      text:
        'The letter was folded small enough to live inside the watch. He carried both for sixty years: the apology, and the hour.',
    },
    {
      id: 'd6',
      a: 'bench',
      b: 'photo',
      core: false,
      title: 'The bench remembers',
      text:
        'E + J, 1962. The town kept the initials even when the people stopped speaking. Some things are remembered by furniture.',
    },
  ];

  D.boardHints = {
    d1: 'The watch carries a name. The photograph carries a face.',
    d2: 'What else happened at 8:17? The station still keeps its timetable.',
    d3: 'The letter explains the choice. The ledger shows the habit.',
    d4: 'She bought a platform ticket. The photograph shows why.',
    d5: 'The letter was folded to fit somewhere very small.',
    d6: 'Two initials were cut into a bench. Who do they belong to?',
  };

  /* ------------------------------------------------------------
     Journal
     ------------------------------------------------------------ */
  D.acts = [
    {
      id: 'watch',
      title: 'A watch, stopped',
      text: 'Mara left the watch. It stopped at 8:17. Someone cut a name into the back.',
      done: (S) => !!S.flags.caseOpen,
    },
    {
      id: 'photo',
      title: 'A face in the rain',
      text: 'Wren found a photograph from 1962. Elias and June, outside the station.',
      done: (S) => !!S.flags.photoFound,
    },
    {
      id: 'train',
      title: 'The 8:17',
      text: 'The station timetable explains the hour. The train to Ashcombe. Platform two.',
      done: (S) => !!S.flags.timetableFound,
    },
    {
      id: 'letter',
      title: 'What the watch kept',
      text: 'Theo opened the seam in the case. There was a letter folded inside.',
      done: (S) => !!S.flags.letterFound,
    },
    {
      id: 'june',
      title: 'June’s side',
      text: 'June told you what she remembers. She waited until twenty to nine.',
      done: (S) => !!S.flags.juneStory,
    },
    {
      id: 'threads',
      title: 'The whole story',
      text: 'Tie the four threads on the clue board. The truth is in what connects.',
      done: (S) => LT.data.coreDeductions(S) >= 4,
    },
    {
      id: 'decision',
      title: 'A decision',
      text: 'Decide what should happen to the watch and the letter.',
      done: (S) => !!S.ending,
    },
  ];

  D.coreDeductions = (S) =>
    D.connections.filter((c) => c.core && S.deductions && S.deductions[c.id]).length;

  D.thought = (S) => {
    if (S.ending) {
      if (S.ending === 'returned')
        return 'The watch is keeping good time now. The shop feels a little larger than it did.';
      return 'The watch keeps its hour under glass. Some evenings you take it out and hold it.';
    }
    if (!S.flags.caseOpen) return 'Mara is waiting by the counter. The rain is making its mind up.';
    if (!S.clues.watch_engraving || !S.clues.watch_seam) {
      return 'The watch is in your satchel. Look closely — turn it over, click the small glimmers.';
    }
    if (!S.flags.photoFound) {
      return 'The engraving says June. Someone in this town remembers Elias. Wren sees everything from her flower cart.';
    }
    if (!S.flags.timetableFound) {
      return '8:17 is a time, not a guess. The station keeps an old timetable under the canopy.';
    }
    if (!S.flags.letterFound) {
      return S.clues.watch_seam
        ? 'The seam in the watch case needs a proper tool. Theo Marchetti repairs clocks on Chapel Lane.'
        : 'There is a seam in the watch case. Look closer before you take it to Theo.';
    }
    if (!S.flags.juneStory) {
      return 'June Halley sits on the station bench most evenings. The photograph might give her a reason to talk.';
    }
    const core = D.coreDeductions(S);
    if (core < 4) {
      return `The story is nearly whole. Tie the threads on the clue board — ${core} of 4 found.`;
    }
    return 'You know what happened. Decide what should happen to the watch and the letter. The counter is waiting.';
  };

  D.placeNotes = {
    shop: {
      name: 'The Little Things',
      sub: 'Antiques & lost objects · Chapel Lane',
      text:
        'Your shop. Warm lamps, cold rain at the window, and more shelves than sense. The previous owner left a cat, a gramophone, and a very good chair.',
    },
    street: {
      name: 'Chapel Lane',
      sub: 'Harrowmere · the wet part of town',
      text:
        'Narrow cobbles, old shopfronts, and a station at the end of the road. Wren’s flower cart keeps the street honest. The rain keeps everyone else indoors.',
    },
    clock: {
      name: 'Marchetti & Son',
      sub: 'Clock repair · by appointment and accident',
      text:
        'A workshop that smells of brass polish and strong tea. Hundreds of clocks disagree quietly about the time. Theo is usually right about one of them.',
    },
    station: {
      name: 'Harrowmere Station',
      sub: 'Platform two · no trains, plenty of waiting',
      text:
        'A station preserved by stubbornness. The 8:17 no longer runs. June Halley still sits on the bench most evenings, with a thermos and the weather.',
    },
  };

  /* ------------------------------------------------------------
     Scenes and interactions
     ------------------------------------------------------------ */
  D.scenes = {
    shop: {
      id: 'shop',
      name: 'The Little Things',
      sub: 'Harrowmere · 6:40 p.m.',
      w: 1500,
      h: 1000,
      spawn: { x: 760, y: 810, dir: 'down' },
      surface: 'wood',
      walk: { x: 80, y: 470, w: 1340, h: 480 },
      blockers: [
        { x: 920, y: 460, w: 330, h: 230 },
        { x: 120, y: 555, w: 290, h: 220 },
        { x: 420, y: 465, w: 250, h: 115 },
        { x: 1380, y: 440, w: 100, h: 150 },
        { x: 390, y: 555, w: 85, h: 80 },
      ],
      hotspots: [
        {
          id: 'counter',
          x: 1085,
          y: 610,
          r: 120,
          label: 'The counter',
          action: 'counter',
          marker: true,
        },
        {
          id: 'shelves',
          x: 660,
          y: 330,
          r: 110,
          label: 'The shelves',
          action: 'decorate',
          marker: true,
          cond: (S) => !!S.flags.caseOpen,
        },
        {
          id: 'window',
          x: 235,
          y: 310,
          r: 100,
          label: 'The rain at the window',
          action: 'shop_window',
          marker: true,
        },
        {
          id: 'gramophone',
          x: 545,
          y: 520,
          r: 85,
          label: 'The gramophone',
          action: 'gramophone',
          marker: true,
        },
        {
          id: 'cat',
          x: 280,
          y: 640,
          r: 85,
          label: 'Pepper, asleep',
          action: 'cat',
          marker: true,
        },
        {
          id: 'mug',
          x: 432,
          y: 585,
          r: 55,
          label: 'A mug of something',
          action: 'mug',
          marker: true,
        },
        {
          id: 'door',
          x: 1360,
          y: 420,
          r: 105,
          label: 'Step out to Chapel Lane',
          action: 'go_street',
          marker: true,
        },
        {
          id: 'bluebird',
          x: 1010,
          y: 690,
          r: 60,
          label: 'A small blue bird',
          action: 'bluebird',
          marker: true,
          cond: (S) => !!S.flags.bluebirdFound && !S.flags.bluebirdPlaced,
        },
      ],
      characters: [
        {
          id: 'mara',
          x: 1060,
          y: 780,
          dir: 'up',
          cond: (S) => !S.flags.introDone || !!S.flags.epilogue,
          schedule: (S) => (S.flags.epilogue ? { x: 1130, y: 760, dir: 'down' } : null),
        },
      ],
    },
    street: {
      id: 'street',
      name: 'Chapel Lane',
      sub: 'Harrowmere · 6:52 p.m.',
      w: 1900,
      h: 1000,
      spawn: { x: 340, y: 650, dir: 'right' },
      surface: 'stone',
      walk: { x: 70, y: 580, w: 1780, h: 370 },
      blockers: [
        { x: 800, y: 555, w: 255, h: 210 },
        { x: 540, y: 650, w: 26, h: 26 },
        { x: 1190, y: 650, w: 26, h: 26 },
        { x: 1720, y: 470, w: 170, h: 110 },
      ],
      hotspots: [
        {
          id: 'shop_door',
          x: 300,
          y: 500,
          r: 105,
          label: 'Back into the shop',
          action: 'go_shop',
          marker: true,
        },
        {
          id: 'wren',
          x: 1120,
          y: 670,
          r: 100,
          label: 'Wren, at the flower cart',
          action: 'talk_wren',
          marker: true,
        },
        {
          id: 'clock_door',
          x: 1510,
          y: 515,
          r: 100,
          label: 'Marchetti & Son',
          action: 'go_clock',
          marker: true,
        },
        {
          id: 'station_path',
          x: 1805,
          y: 585,
          r: 110,
          label: 'The path to the station',
          action: 'go_station',
          marker: true,
        },
        {
          id: 'notice',
          x: 665,
          y: 535,
          r: 80,
          label: 'The notice board',
          action: 'notice',
          marker: true,
        },
        {
          id: 'puddle',
          x: 1235,
          y: 835,
          r: 70,
          label: 'A deep puddle',
          action: 'puddle',
          marker: true,
        },
        {
          id: 'lamp_street',
          x: 560,
          y: 665,
          r: 55,
          label: 'The street lamp',
          action: 'street_lamp',
          marker: true,
        },
      ],
      characters: [
        {
          id: 'wren',
          x: 1120,
          y: 670,
          dir: 'down',
          cond: () => true,
        },
      ],
    },
    clock: {
      id: 'clock',
      name: 'Marchetti & Son',
      sub: 'Clock repair · Chapel Lane',
      w: 1500,
      h: 1000,
      spawn: { x: 240, y: 620, dir: 'right' },
      surface: 'wood',
      walk: { x: 80, y: 520, w: 1340, h: 430 },
      blockers: [
        { x: 760, y: 500, w: 560, h: 240 },
        { x: 300, y: 420, w: 420, h: 80 },
        { x: 1320, y: 400, w: 160, h: 120 },
      ],
      hotspots: [
        {
          id: 'theo',
          x: 1090,
          y: 650,
          r: 110,
          label: 'Theo, at his bench',
          action: 'talk_theo',
          marker: true,
        },
        {
          id: 'workbench',
          x: 930,
          y: 660,
          r: 100,
          label: 'The workbench',
          action: 'workbench',
          marker: true,
        },
        {
          id: 'bigclock',
          x: 430,
          y: 300,
          r: 90,
          label: 'The longcase clock',
          action: 'bigclock',
          marker: true,
        },
        {
          id: 'clock_door',
          x: 145,
          y: 440,
          r: 100,
          label: 'Back to Chapel Lane',
          action: 'go_street_clock',
          marker: true,
        },
      ],
      characters: [
        {
          id: 'theo',
          x: 1090,
          y: 650,
          dir: 'down',
          cond: () => true,
        },
      ],
    },
    station: {
      id: 'station',
      name: 'Harrowmere Station',
      sub: 'Platform two · 7:05 p.m.',
      w: 1900,
      h: 1000,
      spawn: { x: 200, y: 660, dir: 'right' },
      surface: 'stone',
      walk: { x: 60, y: 540, w: 1780, h: 250 },
      blockers: [
        { x: 1250, y: 595, w: 280, h: 115 },
        { x: 230, y: 610, w: 220, h: 105 },
        { x: 1560, y: 530, w: 150, h: 100 },
        { x: 700, y: 590, w: 24, h: 24 },
        { x: 1200, y: 590, w: 24, h: 24 },
      ],
      hotspots: [
        {
          id: 'june',
          x: 1390,
          y: 645,
          r: 110,
          label: 'June, on the bench',
          action: 'talk_june',
          marker: true,
        },
        {
          id: 'timetable',
          x: 565,
          y: 400,
          r: 105,
          label: 'The old timetable',
          action: 'inspect_timetable',
          marker: true,
        },
        {
          id: 'bench',
          x: 335,
          y: 665,
          r: 85,
          label: 'The old bench',
          action: 'bench',
          marker: true,
        },
        {
          id: 'ticket_window',
          x: 870,
          y: 405,
          r: 90,
          label: 'The ticket window',
          action: 'ticket_window',
          marker: true,
        },
        {
          id: 'station_clock',
          x: 1100,
          y: 330,
          r: 80,
          label: 'The station clock',
          action: 'station_clock',
          marker: true,
        },
        {
          id: 'rails',
          x: 930,
          y: 850,
          r: 110,
          label: 'The empty rails',
          action: 'rails',
          marker: true,
        },
        {
          id: 'crate',
          x: 1635,
          y: 560,
          r: 70,
          label: 'Lost property',
          action: 'crate',
          marker: true,
        },
        {
          id: 'station_exit',
          x: 100,
          y: 640,
          r: 105,
          label: 'Back along Chapel Lane',
          action: 'go_street_station',
          marker: true,
        },
      ],
      characters: [
        {
          id: 'june',
          x: 1390,
          y: 645,
          dir: 'left',
          cond: () => true,
        },
      ],
    },
  };

  /* ------------------------------------------------------------
     Decor
     ------------------------------------------------------------ */
  D.decor = [
    {
      id: 'lamp',
      name: 'The hanging lamp',
      options: [
        { id: 'amber', name: 'Amber glass', desc: 'Warm, and a little unsteady.', unlocked: () => true },
        { id: 'rose', name: 'Rose glass', desc: 'A softer light for old paper.', unlocked: (S) => !!S.flags.caseOpen },
        { id: 'sea', name: 'Sea glass', desc: 'Green, like the window of a train.', unlocked: (S) => !!S.ending },
      ],
    },
    {
      id: 'rug',
      name: 'The rug',
      options: [
        { id: 'rose', name: 'Faded rose', desc: 'Worn thin by a hundred quiet feet.', unlocked: () => true },
        { id: 'midnight', name: 'Midnight blue', desc: 'It makes the brass look older.', unlocked: (S) => !!S.flags.photoFound },
        { id: 'cornflower', name: 'Cornflower', desc: 'A blue that insists on spring.', unlocked: (S) => !!S.ending },
      ],
    },
    {
      id: 'sill',
      name: 'The windowsill',
      options: [
        { id: 'fern', name: 'A tired fern', desc: 'It has opinions about the rain.', unlocked: () => true },
        { id: 'narcissus', name: 'Paper whites', desc: 'June brought them. They smell of the station in spring.', unlocked: (S) => !!S.ending },
        { id: 'bluebird', name: 'The blue bird', desc: 'Chipped, blue, and looking out at the weather.', unlocked: (S) => !!S.flags.bluebirdFound },
      ],
    },
    {
      id: 'wall',
      name: 'The wall above the shelves',
      options: [
        { id: 'empty', name: 'An empty frame', desc: 'Waiting for the right thing.', unlocked: () => true },
        { id: 'leaves', name: 'Pressed leaves', desc: 'From the box Wren kept. They have lasted this long.', unlocked: (S) => !!S.flags.photoFound },
        { id: 'station', name: 'The station, 1962', desc: 'Elias and June, framed at last.', unlocked: (S) => S.ending === 'returned' },
        { id: 'watch', name: 'The watch card', desc: 'A small card, a stopped hour, a private story.', unlocked: (S) => S.ending === 'kept' },
      ],
    },
  ];

  /* ------------------------------------------------------------
     Notes for curious interactions
     ------------------------------------------------------------ */
  D.notes = {
    shop_window: 'The rain has been at the window all day. It makes the street look like a painting someone left out.',
    gramophone: 'The gramophone still works. The needle finds an old waltz, slightly warped, as if the song has been walking in the rain.',
    cat: 'Pepper is asleep in the chair. She purrs like a small engine that has nowhere to be.',
    mug: 'The mug is warm. Someone — probably Wren — left it on the side table with a saucer over the top.',
    shelf: 'The shelves are full of things nobody claimed: a jar of buttons, a stuffed owl with one eye, a box of keys to doors that no longer exist.',
    notice: 'The notice board: a lost cat (found), a piano for sale (haunted), and a poster for the station’s “Last Train” exhibition, 1983.',
    puddle: 'A deep puddle holds the whole street upside down. You step around it, mostly.',
    street_lamp: 'The lamp buzzes softly, warming the rain into a small gold room.',
    bigclock: 'The longcase clock is eleven minutes slow. Theo says it is “making a point.”',
    workbench: 'The workbench is covered in tiny brass organs: springs, screws, a cup of tea gone cold. Everything is in its place, if you are Theo.',
    ticket_window: 'The ticket window is shuttered. A sign says CLOSED, but someone has drawn a small train under it in biro.',
    station_clock: 'The station clock is electric now. It keeps perfect time, which somehow makes the platform feel emptier.',
    rails: 'The rails go on into the fog. Somewhere beyond it, the 8:17 is still leaving, over and over, in somebody’s head.',
    crate: 'The lost property crate holds one glove, a child’s umbrella, and a paperback with the last page torn out.',
    bench: 'The old bench has been here longer than the timetable. It has been sat on by a great many people who were waiting for something.',
    counter: 'The counter is where the shop does its thinking. A brass bell, a ledger, a lamp with a crooked shade.',
    watch_crown: 'The winding crown turns freely. It has not been wound in a long time.',
    photo_station: 'The station sign in the photograph is the same one that hangs there now.',
    bluebird_chip: 'A chipped blue bird from Wren. It would look well on the windowsill.',
    bluebird: 'Wren left the blue bird on the counter with a note. “Found on the cart. Thought of your window.”',
  };

  /* ------------------------------------------------------------
     Dialogue
     Each character returns a node. Nodes:
     { speaker, lines, topics, onEnter, onEnd, end, allowLeave }
     Topic: { id, label, cond, once, run }
     A topic’s run may return another node; after it, the runner
     returns to the parent topic list unless the node has `end`.
     ------------------------------------------------------------ */
  const has = (S, item) => !!S.items[item];
  const clue = (S, id) => !!S.clues[id];
  const core = (S) => D.coreDeductions(S);

  function node(speaker, lines, topics, extra) {
    return Object.assign({ speaker, lines, topics }, extra || {});
  }

  D.dialogues = {
    /* ---------------- MARA ---------------- */
    maraIntro(S) {
      return node(
        'mara',
        [
          'The sign says you take in lost things.',
          'I hope that’s still true. The last owner used to let me sit by the stove when I was small. I don’t suppose he mentioned me.',
        ],
        [
          {
            id: 'stove',
            label: 'He left me the shop. Not the stove.',
            run: () =>
              node('mara', ['Then he trusted you with the important part.'], null, { back: true }),
          },
          {
            id: 'lost',
            label: 'Tell me what you’ve lost.',
            run: () => D.dialogues.maraIntroWatch(S),
          },
          {
            id: 'later',
            label: 'Give me a moment to open up.',
            cond: () => false,
          },
        ],
        { allowLeave: false }
      );
    },

    maraIntroWatch(S) {
      return node(
        'mara',
        [
          'My grandfather died in March. We’ve been clearing the house.',
          'This was in his desk, wrapped in a handkerchief, which is a very grandfather thing to do.',
          'It stopped at 8:17. And there’s a name on the back that isn’t anyone in our family.',
        ],
        [
          {
            id: 'look',
            label: 'May I see it?',
            run: () => D.dialogues.maraIntroWatch2(S),
          },
          {
            id: 'who',
            label: 'Who was your grandfather?',
            run: () =>
              node(
                'mara',
                [
                  'Elias Voss. He ran the post office on Chapel Lane for forty years.',
                  'He was quiet. He liked crosswords and tinned peaches. He never talked about before I was born.',
                ],
                null,
                { back: true }
              ),
          },
          {
            id: 'june',
            label: 'Do you know a June?',
            run: () =>
              node(
                'mara',
                [
                  'No. Dad doesn’t either. I asked, and he got that careful face people get when they don’t want to say “I don’t know.”',
                ],
                null,
                { back: true }
              ),
          },
        ],
        { allowLeave: false }
      );
    },

    maraIntroWatch2(S) {
      return node(
        'mara',
        [
          'June. “For June. 8:17. E.”',
          'I thought I knew him. Now I’m not so sure.',
          'I don’t want it fixed, exactly. I want to know why it stopped. Can you… sit with it for a while?',
        ],
        [
          {
            id: 'yes',
            label: 'I’ll find out what I can.',
            run: () =>
              node(
                'mara',
                [
                  'Thank you. I’ll come by in a few days. Or you can find me at the shop — I mean, my shop. The bookshop. You can find me there.',
                  'The bell over the door is the same. I’m glad.',
                ],
                null,
                {
                  end: true,
                  onEnd: () => LT.game.finishIntro(),
                }
              ),
          },
          {
            id: 'who2',
            label: 'Who was your grandfather?',
            run: () =>
              node(
                'mara',
                [
                  'Elias Voss. Post office, Chapel Lane. Quiet. Crosswords. Tinned peaches.',
                  'He never talked about before I was born. I thought it was just… what old people are like.',
                ],
                null,
                { back: true }
              ),
          },
        ],
        { allowLeave: false }
      );
    },

    mara(S) {
      if (S.flags.epilogue) {
        if (S.ending === 'returned') {
          return node(
            'mara',
            [
              'She wrote to me. June. A proper letter, on paper.',
              'She said my grandfather was a terrible dancer and a good man. I’ve been carrying it around all week.',
              'Thank you. For giving him back to us.',
            ],
            [
              {
                id: 'dancing',
                label: 'A terrible dancer?',
                run: () =>
                  node(
                    'mara',
                    [
                      'Apparently he counted out loud. She said it was the bravest thing she’d ever seen.',
                      'I keep trying to picture it. Him, young, counting. Her, trying not to laugh.',
                    ],
                    null,
                    { back: true }
                  ),
              },
              {
                id: 'watch',
                label: 'The watch?',
                run: () =>
                  node(
                    'mara',
                    [
                      'She has it. She said she’d wind it every morning, and if it ever stopped again she’d know it was time for a cup of tea.',
                      'I think that’s how she says she’s happy.',
                    ],
                    null,
                    { back: true }
                  ),
              },
            ]
          );
        }
        return node(
          'mara',
          [
            'I keep looking at the case.',
            'You didn’t tell her. I’m not sure I would have either. That’s not the same as understanding it.',
            'I don’t know if I forgive you. But I’d like to keep coming by, if that’s all right.',
          ],
          [
            {
              id: 'why',
              label: 'I thought it was kinder.',
              run: () =>
                node(
                  'mara',
                  [
                    'Maybe. Kindness is a strange thing. It can look like a locked door from the outside.',
                    'I’m glad the watch is somewhere warm. I’m not glad it’s a secret. Both can be true.',
                  ],
                  null,
                  { back: true }
                ),
            },
            {
              id: 'tea',
              label: 'There’s always tea.',
              run: () =>
                node(
                  'mara',
                  [
                    'Good. I’ll bring biscuits. The nice ones, not the ones from the tin that’s been open since 1998.',
                  ],
                  null,
                  { back: true }
                ),
            },
          ]
        );
      }
      return node('mara', ['The shop is warm. I’d almost forgotten what that was like.'], null, {
        allowLeave: true,
      });
    },

    /* ---------------- WREN ---------------- */
    wren(S) {
      if (S.ending) {
        if (S.ending === 'returned') {
          return node(
            'wren',
            [
              'There you are. The whole street’s heard about the watch. Well — I’ve heard, and I’ve told the street. That’s how it works.',
              'June came by for flowers this morning. Blue ones. She said they were for a window. I didn’t ask whose.',
            ],
            [
              {
                id: 'june',
                label: 'She seems… lighter.',
                run: () =>
                  node(
                    'wren',
                    [
                      'Lighter? She told me my roses were “overpriced but adequate.” For June, that’s a sonnet.',
                      'You did a good thing. Don’t let it go to your head. You’ve still got a leaking gutter.',
                    ],
                    null,
                    { back: true }
                  ),
              },
              {
                id: 'blue',
                label: 'The blue bird?',
                run: () =>
                  node(
                    'wren',
                    [
                      'Found it on the cart. Chipped wing, good face. It wanted a window.',
                      'Put it wherever it looks happiest. Things don’t need a purpose, you know. They just need a place.',
                    ],
                    null,
                    { back: true }
                  ),
              },
            ]
          );
        }
        return node(
          'wren',
          [
            'The watch in the case. I saw it through the window. It looks very… official.',
            'I’m not going to ask what you did or didn’t tell her. I’ve been the one who tells people things, and I’ve been the one who doesn’t. Neither is comfortable.',
          ],
          [
            {
              id: 'june',
              label: 'June still sits at the station.',
              run: () =>
                node(
                  'wren',
                  [
                    'She does. Some people wait for a train. Some people wait for a reason to stop waiting.',
                    'You keep the shop warm. That’s not nothing.',
                  ],
                  null,
                  { back: true }
                ),
            },
            {
              id: 'blue',
              label: 'The blue bird?',
              run: () =>
                node(
                  'wren',
                  [
                    'Found it on the cart. Chipped wing, good face. It wanted a window.',
                    'Put it wherever it looks happiest. Things don’t need a purpose, you know. They just need a place.',
                  ],
                  null,
                  { back: true }
                ),
            },
          ]
        );
      }

      const first = !S.flags.metWren;
      const intro = first
        ? [
            'You’re the new one. I’m Wren. I sell flowers and unsolicited advice. The shop’s been dark for a month; I was starting to talk to the window boxes.',
            'They’re terrible conversationalists. Lovely colour, though.',
          ]
        : [
            'Back again. The rain’s got worse, the flowers have got cheaper, and I’ve got a theory about the vicar.',
            'Ask me something before I share it.',
          ];

      const topics = [
        {
          id: 'town',
          label: 'What’s Harrowmere like?',
          run: () =>
            node(
              'wren',
              [
                'Small enough to know when the bread’s late. Old enough to have opinions about it.',
                'The rain keeps the tourists away and the roses honest. The station keeps the past. We’re very good at keeping things here.',
              ],
              null,
              { back: true, note: 'wren_town' }
            ),
        },
        {
          id: 'shop',
          label: 'Did you know the previous owner?',
          run: () =>
            node(
              'wren',
              [
                'Your great-aunt. She was here before the war, then after it, then somehow all the years between.',
                'She’d be glad the lamps are on. She used to say a shop is just a promise that somebody will come back.',
              ],
              null,
              { back: true }
            ),
        },
        {
          id: 'flowers',
          label: 'How are the flowers?',
          run: () =>
            node(
              'wren',
              [
                'Drowning. But they’re cheaper wet. The chrysanthemums are putting up a fight.',
                'If you want something for the shop, take a bunch. No charge. Consider it a neighbourhood improvement scheme.',
              ],
              null,
              { back: true }
            ),
        },
      ];

      if (S.flags.caseOpen && !S.flags.photoFound) {
        topics.unshift({
          id: 'elias',
          label: 'I’m looking into a watch. The name Elias Voss came up.',
          run: () => {
            LT.game.effect.item('photo');
            LT.game.effect.flag('photoFound', true);
            LT.game.effect.clue('photo_faces');
            LT.game.effect.clue('photo_back');
            LT.game.effect.note('wren_observation');
            LT.game.effect.note('mara_account');
            LT.game.effect.card('photo');
            return node(
              'wren',
              [
                'Elias Voss. Post office on Chapel Lane. He used to frank my seed orders and pretend he hadn’t read the catalogues.',
                'Wait. The house clearance — I took a box for the historical society, then the society dissolved. There’s a photograph in it.',
                'That’s him. Young. And that’s June Halley, before she was June Halley. She’s still about. Station bench, most evenings.',
                'Bring a good reason. She doesn’t like being fussed over.',
              ],
              [
                {
                  id: 'photo_show',
                  label: 'Let me look at the photograph.',
                  run: () => {
                    LT.game.openInspect('photo');
                    return null;
                  },
                },
                {
                  id: 'june',
                  label: 'June Halley?',
                  run: () =>
                    node(
                      'wren',
                      [
                        'Retired from the station. Thirty-one years behind the ticket window. Sharp as a pin, soft as a brick.',
                        'If she doesn’t want to talk, she’ll tell you in no uncertain terms. If she does want to talk, she’ll still tell you in no uncertain terms.',
                      ],
                      null,
                      { back: true }
                    ),
                },
              ]
            );
          },
        });
      } else if (S.flags.photoFound && !S.flags.juneStory) {
        topics.unshift({
          id: 'june_reminder',
          label: 'June Halley — where do I find her?',
          run: () =>
            node(
              'wren',
              [
                'Station. Platform two. Most evenings, rain or otherwise.',
                'She’ll be the one not waiting for a train.',
              ],
              null,
              { back: true }
            ),
        });
      } else if (S.flags.juneStory && !S.ending) {
        topics.unshift({
          id: 'advice',
          label: 'I know most of it now. What do I do with it?',
          run: () =>
            node(
              'wren',
              [
                'That’s not a flower question. That’s a shopkeeper question.',
                'You’ve got a watch and a letter and two people who’ve been carrying the same silence for sixty years. Whatever you do, do it on purpose.',
                'And put the kettle on first. Big decisions are smaller with tea.',
              ],
              null,
              { back: true }
            ),
        });
      }

      topics.push({
        id: 'advice_general',
        label: 'Any advice?',
        run: () =>
          node('wren', [D.thought(S), 'That’s the advice. It’s free. The flowers are not.'], null, {
            back: true,
          }),
      });

      if (!S.flags.metWren) topics.push({ id: 'bye', label: 'I should get back to the shop.', run: () => null });

      return node('wren', intro, topics);
    },

    /* ---------------- THEO ---------------- */
    theo(S) {
      if (S.ending && S.flags.letterFound) {
        return node(
          'theo',
          [
            'The watch? No, don’t tell me. I’ve been thinking about it for a week, which is bad for business.',
            S.ending === 'returned'
              ? 'I heard it’s keeping time again. Good. Clocks should be allowed to be late, occasionally. It keeps them humble.'
              : 'I heard it’s under glass now. A stopped watch in a shop full of working ones. That’s either a joke or a sermon.',
          ],
          [
            {
              id: 'ledger',
              label: 'The ledger — thank you for showing me.',
              run: () =>
                node(
                  'theo',
                  [
                    'My father would have liked you. He liked anyone who read the margins.',
                    'He used to say a repair is just an argument with time that you win for a little while. I think he’d have liked Elias. Stubborn. Paid on time.',
                  ],
                  null,
                  { back: true }
                ),
            },
            {
              id: 'clocks',
              label: 'How are the clocks?',
              run: () =>
                node(
                  'theo',
                  [
                    'They’re all wrong, but they’re wrong together. That’s the important thing.',
                    'The cuckoo’s been sulking since Tuesday. I’ve tried reason. I’ve tried oil. Tomorrow I’ll try leaving it alone.',
                  ],
                  null,
                  { back: true }
                ),
            },
          ]
        );
      }

      const first = !S.flags.metTheo;
      const intro = first
        ? [
            'Mind the— yes, that one. It bites.',
            'Theo Marchetti. Clocks, music boxes, the occasional stubborn toaster. You’ve the look of someone carrying a question.',
          ]
        : [
            'Back again. The cuckoo’s still sulking, the kettle’s still warm. Sit, if you can find a chair that isn’t full of springs.',
          ];

      const topics = [
        {
          id: 'shop',
          label: 'How long have you had this shop?',
          run: () =>
            node(
              'theo',
              [
                'Forty years. My father had it before me. He believed every clock deserved a second chance. I believe most deserve a quiet retirement.',
                'The difference is why I’m still here and he isn’t.',
              ],
              null,
              { back: true }
            ),
        },
        {
          id: 'clocks',
          label: 'Do they all work?',
          run: () =>
            node(
              'theo',
              [
                'Define work. The longcase is eleven minutes slow and making a point. The cuckoo is sulking. The little brass one has been five minutes fast since 1974 and I’ve stopped arguing.',
                'Time is not a science in this shop. It’s a household.',
              ],
              null,
              { back: true }
            ),
        },
      ];

      if (has(S, 'watch')) {
        topics.unshift({
          id: 'watch',
          label: 'I have a watch that needs looking at.',
          run: () => {
            if (!S.clues.watch_seam) {
              LT.game.effect.clue('theo_observation');
              return node(
                'theo',
                [
                  'Finch of Harrowmere. Dead before I was born, but his work lasts. Brass, seven jewels. It’s been loved.',
                  'The hands are set, not fallen. Someone stopped it on purpose — and then kept it clean for sixty years. That’s not neglect. That’s a decision.',
                  'There’s a seam around the back, I’d swear it. Finch made a few of these for sensitive correspondence. Look closer. Come back when you’ve found it.',
                ],
                null,
                { back: true }
              );
            }
            if (!S.flags.letterFound) {
              return node(
                'theo',
                [
                  'Finch of Harrowmere. Dead before I was born, but his work lasts. Brass, seven jewels. It’s been loved.',
                  'The hands are set, not fallen. Someone stopped it on purpose — and then kept it clean for sixty years. That’s not neglect. That’s a decision.',
                  'And there — that seam. A secret pocket. I can open it. I won’t read what’s inside. Bad for the mechanism, other people’s letters.',
                ],
                [
                  {
                    id: 'open',
                    label: 'Please open it.',
                    run: () => {
                      LT.game.effect.flag('theoOpened', true);
                      LT.game.effect.clue('theo_observation');
                      return node(
                        null,
                        [
                          'Theo sets the watch in a small brass clamp. The room fills with ticking.',
                          'He works the seam open with a tool thinner than a needle. Something pale slides out: a letter, folded to the size of a thumbnail.',
                          'He does not read it. He hands it to you, then turns back to his bench and picks up a screwdriver as if nothing has happened.',
                        ],
                        null,
                        {
                          end: true,
                          onEnd: () => {
                            LT.game.effect.item('letter');
                            LT.game.effect.flag('letterFound', true);
                            LT.game.effect.clue('letter_opening');
                            LT.game.effect.clue('letter_reason');
                            LT.game.effect.clue('letter_signature');
                            LT.game.effect.clue('letter_flower');
                            LT.game.effect.clue('ledger_entry');
                            LT.game.effect.clue('ledger_margin');
                            LT.game.effect.card('letter');
                            LT.game.effect.card('ledger');
                            LT.game.effect.note('letter_reason');
                            LT.game.effect.note('ledger_entry');
                            LT.game.closeDialogue();
                            setTimeout(() => LT.game.openInspect('letter'), 280);
                          },
                        }
                      );
                    },
                  },
                  {
                    id: 'notyet',
                    label: 'Not yet. Let me think.',
                    run: () =>
                      node(
                        'theo',
                        ['Sensible. The watch has waited sixty years. It can wait for tea.'],
                        null,
                        { back: true }
                      ),
                  },
                ]
              );
            }
            return node(
              'theo',
              [
                'You opened it. Or I did. Same thing, different hands.',
                'I don’t read other people’s letters. But I can tell you the watch was folded around that paper for a very long time. The creases have gone into the brass.',
              ],
              null,
              { back: true }
            );
          },
        });
      }

      if (S.flags.photoFound || S.flags.caseOpen) {
        topics.push({
          id: 'elias',
          label: 'Elias Voss — did he ever come here?',
          run: () =>
            node(
              'theo',
              [
                'Elias. Came in every few years with that watch. Never let me reset the hands.',
                '“Clean and oil,” he’d say. “Leave the time alone.” My father kept a ledger. I’ll find it if it matters.',
                'It matters, doesn’t it. You’ve got the face of someone for whom it matters.',
              ],
              null,
              { back: true }
            ),
        });
      }

      topics.push({
        id: 'advice',
        label: 'What do you make of it all?',
        run: () => node('theo', [D.thought(S)], null, { back: true }),
      });

      return node('theo', intro, topics);
    },

    /* ---------------- JUNE ---------------- */
    june(S) {
      if (S.ending === 'returned') {
        return node(
          'june',
          [
            'You’re back. Good. I’ve been practising being a person with a working watch. It’s exhausting.',
            'I wound it this morning. It’s keeping good time. Annoyingly.',
          ],
          [
            {
              id: 'watch',
              label: 'May I see it?',
              run: () =>
                node(
                  'june',
                  [
                    'No. It’s in my pocket, and it’s staying there.',
                    'But you can sit. The bench is dry, mostly. The 8:17 still doesn’t run, in case you were wondering. Some things are more reliable than trains.',
                  ],
                  null,
                  { back: true }
                ),
            },
            {
              id: 'elias',
              label: 'What was he like? Really.',
              run: () =>
                node(
                  'june',
                  [
                    'Terrible dancer. Counted out loud. Brought me a cornflower every September and pretended it was from the station garden.',
                    'Kind. Frightened of being kind, which is the worst kind of frightened. He thought staying was the same as failing.',
                    'I’d have stayed, you know. If he’d asked. That’s the part I’ve had sixty years to be angry about. He never asked.',
                  ],
                  null,
                  { back: true }
                ),
            },
          ]
        );
      }

      const first = !S.flags.metJune;
      const intro = first
        ? [
            'The station’s closed, love. Has been since the last train. The bench is still open.',
            'I’m June. I worked the ticket window here for thirty-one years. I know every ghost on this platform.',
          ]
        : [
            'Still here. The rain’s not going anywhere, and neither am I.',
            'Sit down, if you like. The bench doesn’t bite. I might.',
          ];

      const topics = [
        {
          id: 'station',
          label: 'Tell me about the station.',
          run: () =>
            node(
              'june',
              [
                'They wanted to close it in ’83. We kept it open with tea and stubbornness. Now it’s a museum with draughts.',
                'I worked the ticket window. You’d be surprised how much of a person you can learn from the way they buy a ticket.',
              ],
              null,
              { back: true }
            ),
        },
        {
          id: 'train',
          label: 'The 8:17 — does it still run?',
          run: () =>
            node(
              'june',
              [
                'Evening to Ashcombe. Last run, October ’63. They took the line out and left the timetable, which is either sentiment or laziness.',
                'People still ask for it. Not often. The ones who do always look like they’ve left something on the platform.',
              ],
              null,
              { back: true }
            ),
        },
      ];

      if (S.flags.caseOpen) {
        topics.unshift({
          id: 'elias',
          label: 'I’m asking about Elias Voss.',
          run: () =>
            node(
              'june',
              [
                'Elias Voss. There’s a name that knows how to ruin an evening.',
                'He was going to meet me here. September, 1962. He didn’t come.',
                'I don’t discuss it. I’ve had sixty years of not discussing it. I’m very good at it.',
              ],
              null,
              { back: true }
            ),
        });
      }

      if (has(S, 'photo') && !S.flags.juneStory) {
        topics.unshift({
          id: 'photo',
          label: 'Show her the photograph.',
          run: () => {
            LT.game.effect.flag('juneStory', true);
            LT.game.effect.item('ticket');
            LT.game.effect.clue('june_account');
            LT.game.effect.clue('ticket_punch');
            LT.game.effect.clue('ticket_date');
            LT.game.effect.card('june');
            LT.game.effect.card('ticket');
            LT.game.effect.note('june_account');
            return node(
              'june',
              [
                '…Where did you get that?',
                'I remember that coat. I saved for months for that coat. He said it made me look like I was going somewhere important.',
                'He was going to bring his father’s watch. He was so proud of it. He said it kept good time.',
                'I waited until the station clock said twenty to nine. Then I went home and made tea, and the next day I went to work, and that was that.',
                'Here. Platform ticket. I found it in my coat pocket a week later. I’ve kept it in a tin with buttons and other useless things.',
              ],
              [
                {
                  id: 'why',
                  label: 'Why didn’t you go after him?',
                  run: () =>
                    node(
                      'june',
                      [
                        'I was eighteen and proud. I thought if he wanted me, he’d come.',
                        'By the time I understood that pride isn’t a plan, too much time had gone. You don’t get to go back and be brave on a Tuesday.',
                      ],
                      null,
                      { back: true }
                    ),
                },
                {
                  id: 'sorry',
                  label: 'I’m sorry.',
                  run: () =>
                    node(
                      'june',
                      [
                        'Don’t be. You weren’t there. Neither was he.',
                        'Sit for a minute, if you’ve got one. The rain’s better with company.',
                      ],
                      null,
                      { back: true }
                    ),
                },
              ]
            );
          },
        });
      }

      if (has(S, 'watch')) {
        topics.push({
          id: 'watch',
          label: 'Show her the watch.',
          run: () => {
            if (S.flags.letterFound) {
              return node(
                'june',
                [
                  '…He kept it.',
                  'You’ve got that look. The one people get before they hand you something.',
                  'I’m eighty-two. I don’t have time for suspense. If there’s something you think I should know, you’ll have to decide what to do with it. I’ve had enough of other people’s decisions.',
                ],
                null,
                { back: true }
              );
            }
            return node(
              'june',
              [
                'He had that in his pocket the day we met. He checked it every five minutes. Drove me mad.',
                'Where did you get it? … I don’t know if I want to know the rest. Don’t tell me unless you’re sure.',
              ],
              null,
              { back: true }
            );
          },
        });
      }

      if (S.flags.juneStory && !S.ending) {
        topics.push({
          id: 'advice',
          label: 'What should I do with the watch?',
          run: () =>
            node(
              'june',
              [
                'You’re asking me? I waited sixty years for an answer. I’m not going to hand you one in an evening.',
                'Do what lets you sleep. That’s the only test I’ve found that works.',
              ],
              null,
              { back: true }
            ),
        });
      }

      return node('june', intro, topics);
    },
  };

  /* ------------------------------------------------------------
     Ending prose
     ------------------------------------------------------------ */
  D.endings = {
    returned: {
      eyebrow: 'The watch that waited · an ending',
      title: 'The hour kept',
      prose: [
        'You take the watch and the letter to the station on a Thursday, when the rain has worn itself out.',
        'June reads the letter twice. She does not cry. She laughs once, quietly, at the part about the bridge.',
        '“He was terribly kind,” she says. “It never once occurred to him that kindness could be a way of breaking someone’s heart.”',
        'You sit with her until the light goes. She tells you about the coat, and the tea, and the walk home. Then she winds the watch, sets it to the correct time, and puts it in her pocket.',
        '“There,” she says. “Now it can be late like the rest of us.”',
      ],
      quote: 'Some things are only ours to carry for a while.',
      epilogue:
        'A week later, a parcel arrives at the shop: the pressed cornflower from the letter, and a photograph of the station in 1962. June has written on the back: “For the window. — J.” The watch keeps good time now. You hear it sometimes, through the wall of the rain.',
      after: 'The watch is with June. The shop keeps the cornflower, and the photograph, and the sound of good time.',
    },
    kept: {
      eyebrow: 'The watch that waited · an ending',
      title: 'The quiet case',
      prose: [
        'You put the watch under glass, on the counter where the lamp can reach it. Beneath it, folded small, the letter.',
        'You write a card in your best hand: “E. Voss. Stopped at 8:17, September 1962. The rest is private.”',
        'Mara comes by on Sunday. She looks at the case for a long time. “You didn’t tell her,” she says. It isn’t quite a question.',
        'You could explain about kindness, and time, and the difference between a secret and a story. Instead you make tea.',
        '“I don’t know if it was the right thing,” she says. “But I understand it.” She leaves the way she came, with the bell saying goodbye.',
        'Some evenings you take the watch out and hold it. You never wind it. The hour stays where he left it.',
      ],
      quote: 'Some truths wait longer than others.',
      epilogue:
        'The shop keeps its small things. June still sits at the station, and the 8:17 still doesn’t run. The watch keeps its hour under glass. You find that you check it, sometimes, the way people check the weather.',
      after: 'The watch stays under glass. Some stories are kept by not being told.',
    },
  };

  D.bluebirdNote = {
    kicker: 'A small thing · after',
    title: 'The blue bird',
    text:
      'Wren left a chipped ceramic bird on the counter, with a note: “Found on the cart. Thought of your window.” It has no story that you know. That is not the same as having no story.',
  };
})();
