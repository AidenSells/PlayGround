// ---------------------------------------------------------------
// THE LITTLE THINGS — conversations, clues, and consequences
// ---------------------------------------------------------------
import {
  state, saveState, addClue, addDeduction, hasDeduction, hasClue,
  unlockPerson, checkFinalReady
} from './state.js';
import { CLUES, DEDUCTIONS, ENDINGS, KEEPSAKES, PEOPLE } from './data.js';
import * as ui from './ui.js';
import { sound } from './audio.js';

let api = {};
let juneIntroRunning = false;

export function initStory(a) {
  api = a || {};
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function gainClue(id) {
  const clue = addClue(id);
  if (clue) ui.noteClue(id);
  return clue;
}

function mark(key, value = true) {
  state.flags[key] = value;
  saveState();
}

function waitForEvidenceClose() {
  return new Promise((resolve) => {
    const poll = setInterval(() => {
      if (!ui.isEvidenceOpen()) { clearInterval(poll); resolve(); }
    }, 120);
  });
}

async function openEvidenceAndWait(kind) {
  const opened = ui.openEvidence(kind);
  if (opened) await waitForEvidenceClose();
}

const line = (who, text, extra = {}) => ({ who, text, ...extra });
const narr = (text, extra = {}) => ({ who: null, text, ...extra });

// ---------------------------------------------------------------
// Opening
// ---------------------------------------------------------------
export async function startIntro() {
  await ui.curtain([
    'Ember Hollow, 6:52 p.m.',
    'The rain has been falling since the afternoon.',
    'The Little Things is open, as it always is.'
  ], { hold: 1700, gap: 450 });

  ui.showHUD();
  ui.resetObjectiveTracking();
  ui.locationCard('The Little Things', 'Your shop · Ember Hollow');

  await ui.say([
    narr('The bell above the door gives a small, wet ring.'),
    narr('A woman stands on the mat with rain in her hair and something closed tight in her fist.'),
    line('mara', 'You’re still open. Good. I was afraid the whole town had gone home.', { note: 'a visitor' }),
    line('you', 'The shop keeps its own hours.'),
    line('mara', 'My grandfather used to say that about the station clock.'),
    narr('She sets a brass pocket watch on the counter. It is warm from her hand. The hands have not moved.'),
    line('mara', 'It stopped at 8:17. It’s been stopped my whole life. I found it in Grandpa Arthur’s things, with a note that just said: *For the shop on Lantern Row.*'),
    line('you', 'Arthur Bell. The stationmaster.'),
    line('mara', 'You knew him?'),
    line('you', 'I know the name. Everyone does.'),
    line('mara', 'Then maybe you can tell me what it means.'),
    line('mara', 'I’ll wait by the window. I’d rather not carry it home without knowing what it is.')
  ]);

  mark('maraGaveWatch');
  mark('introDone');
  state.started = true;
  saveState();
  ui.refreshHUD();
  setTimeout(() => ui.toast('The watch', 'A brass pocket watch, stopped at 8:17.', 'watch'), 500);
  sound.chime(0.045, 0.9);
}

// ---------------------------------------------------------------
// Actions
// ---------------------------------------------------------------
export async function handleAction(action, hotspot) {
  if (!action) return;
  if (action.startsWith('go:')) { await api.go?.(action.slice(3)); return; }
  if (action.startsWith('talk:')) { await talk(action.slice(5)); return; }
  if (action.startsWith('evidence:')) { ui.openEvidence(action.slice(9)); return; }
  if (action.startsWith('keepsake:')) { await takeKeepsake(action.slice(9)); return; }

  switch (action) {
    case 'inspectWatch': await inspectWatch(); return;
    case 'shop:drawer': await shopDrawer(); return;
    case 'shop:cabinet': await shopCabinet(); return;
    case 'station:desk': await stationDesk(); return;
    case 'lighthouse:door': await lighthouseDoor(); return;
    default:
      if (action.startsWith('look:')) {
        const entry = LOOKS[action];
        if (typeof entry === 'function') { await entry(); return; }
        if (entry) { await ui.say(entry); return; }
      }
      await ui.say([narr('You look, but the evening keeps its own counsel.')]);
  }
}

export async function onSceneEnter(sceneId, fromId) {
  if (sceneId === 'station' && !state.flags.stationVisited) {
    mark('stationVisited');
    setTimeout(() => {
      ui.toast('Ember Hollow Station', 'The last stop before the sea. Arthur kept everything here.', 'train');
    }, 750);
  }
  if (sceneId === 'lighthouse' && !state.flags.metJune && hasDeduction('keeperIsJune') && !juneIntroRunning) {
    await juneIntro();
  }
}

// ---------------------------------------------------------------
// The watch
// ---------------------------------------------------------------
async function inspectWatch() {
  const alreadyUnderstood = state.flags.watchInspected;
  await ui.openInspect();
  if (!alreadyUnderstood && state.flags.watchInspected) {
    await ui.say([
      narr('You lay the watch on the counter and look at it for a long moment.'),
      narr('A maker’s mark. A heart-stop. Blue wool stiff with salt. And a name worn soft by a thumb: *June.*'),
      line('you', 'Someone made this watch stop on purpose. Someone wanted this hour kept.'),
      narr('Mara is watching you from the window. You should ask her what she remembers.')
    ]);
    ui.refreshHUD();
  } else if (!state.flags.watchInspected) {
    await ui.say([
      narr('The watch is more than stopped. It has been arranged. There are still details you have not seen.'),
      narr('Turn it over. Open the case back. Look at the chain.')
    ]);
  }
}

// ---------------------------------------------------------------
// Mara
// ---------------------------------------------------------------
async function talkMara() {
  if (state.flags.finished) {
    await maraEpilogue();
    return;
  }
  if (!state.flags.watchInspected) {
    await ui.say([
      narr('Mara stands by the rain-streaked window, turning her gloves over and over in her hands.'),
      line('mara', 'Look at it first. I want to know what you see — not what I hope.'),
      narr('Moth the cat has abandoned his chair to sit and stare at the watch. He does not blink.')
    ]);
    return;
  }
  if (state.flags.talkedMara) {
    await ui.say([
      line('mara', 'I’ll be at the station later. If you find her — June — will you tell me?')
    ]);
    return;
  }

  await ui.say([
    line('mara', 'You’ve been quiet a long time. What is it?'),
    line('you', 'It was made by E. Voss. Inside the case, stamped in the metal. And on the back: *For June. 8:17. E.*'),
    line('mara', 'June. I don’t know a June.'),
    line('you', 'There’s a heart-stop lever under the balance. The watch didn’t run down. Someone made it stop at that minute.'),
    line('mara', 'That’s not a repair. That’s a promise.'),
    line('you', 'There’s blue wool caught in the chain. Salt in it. Paint, too.'),
    line('mara', 'Blue.'),
    narr('She looks at the window, at the rain, at the street beyond it.'),
    line('mara', 'Grandpa Arthur kept everything. Tickets. Timetables. Old gloves he never wore. He never threw a thing away, and he never talked about the station.')
  ]);

  const pick = await ui.choose([
    { key: 'like', text: 'What was your grandfather like?' },
    { key: 'voss', text: 'Did he ever mention Voss & Sons?' },
    { key: 'coat', text: 'There was a blue coat in his things, wasn’t there?' }
  ]);

  if (pick === 'like') {
    await ui.say([
      line('mara', 'Quiet. Kind. He had a way of standing in a doorway as if he were waiting for someone who never came.'),
      line('mara', 'I thought it was just old age. Now I’m not so sure.')
    ]);
  } else if (pick === 'voss') {
    await ui.say([
      line('mara', 'He knew Silas. Everyone does. But he never bought a clock. He said the station clock was enough.'),
      line('mara', 'Silas came to the funeral. He stood at the back and left before the tea.')
    ]);
  } else {
    await ui.say([
      line('mara', 'A blue coat. In the hall closet. I thought it was his.'),
      line('mara', 'It was too small for him. I never asked why he kept it.')
    ]);
  }

  state.flags.arthurKnown = true;
  unlockPerson('arthur');
  saveState();

  await ui.say([
    narr('Mara reaches under the counter before she catches herself. Her hand hovers over the drawer.'),
    line('mara', 'There’s a spare key. In the drawer. He gave it to this shop years ago — *in case someone comes asking.*'),
    line('mara', 'I thought it was nonsense. Grandpa was full of little instructions.'),
    line('you', 'I’ll look.'),
    line('mara', 'I have to go. I said I’d meet someone at the station. The last train, you know.'),
    narr('She pauses at the door. The bell is already moving.'),
    line('mara', 'If you find her — June — will you tell me? I’d like to know what he was waiting for.'),
    line('you', 'I will.'),
    narr('The bell rings once, softly, after she is gone.')
  ]);

  mark('talkedMara');
  saveState();
  ui.refreshHUD();
  sound.door();
  if (!state.flags.hasKey) {
    setTimeout(() => ui.toast('The counter drawer', 'Mara mentioned a spare key. Search the counter.', 'lock'), 900);
  }
}

async function maraEpilogue() {
  const ending = state.flags.ending;
  if (ending === 'keep') {
    await ui.say([
      line('mara', 'I like what you’ve done with the cabinet. The card is a nice touch.'),
      line('you', 'People come in to see it. They bring their own small things.'),
      line('mara', 'Grandpa would have hated the fuss. He’d have come every Thursday anyway.'),
      narr('She stays until the rain eases, then walks home under the shop’s awning light.')
    ]);
  } else if (ending === 'june') {
    await ui.say([
      line('mara', 'I met her at the Larkspur. June. She has Grandpa’s careful way of holding a teacup.'),
      line('you', 'Did you talk about him?'),
      line('mara', 'For hours. It turns out the truth is kinder than the silence was.')
    ]);
  } else if (ending === 'silas') {
    await ui.say([
      line('mara', 'Silas came by. He didn’t say much. He fixed the shop bell, though.'),
      line('you', 'That’s his way.'),
      line('mara', 'I think he’s been waiting to fix something for a long time.')
    ]);
  } else {
    await ui.say([
      line('mara', 'The station clock is working again. Did you know?'),
      line('you', 'I heard.'),
      line('mara', 'No one winds it. Grandpa would have had a theory.'),
      narr('She smiles, and the bell above the door answers for both of you.')
    ]);
  }
}

// ---------------------------------------------------------------
// Alma
// ---------------------------------------------------------------
async function talkAlma() {
  if (!state.flags.metAlma) {
    mark('metAlma');
    await ui.say([
      narr('The Larkspur smells of bergamot, wet wool, and something baking. Alma Finch looks up from a pot of tea.'),
      line('alma', 'There you are. I wondered when the shop would send someone down.'),
      line('you', 'The shop doesn’t usually send anyone.'),
      line('alma', 'Then the evening did. Sit. Take your coat off. The rain isn’t going anywhere.'),
      narr('She pours without asking. The cup is warm enough to make your hands ache.')
    ]);
  } else {
    await ui.say([
      line('alma', 'Back again. Good. The kettle’s still hot.'),
      narr('She pushes a plate of seed cake toward you without looking up.')
    ]);
  }

  let loop = true;
  while (loop) {
    const options = [];
    if (!state.flags.almaJune) options.push({ key: 'june', text: 'Ask about a singer named June Alder.' });
    if (!state.flags.almaKeeper) options.push({ key: 'keeper', text: 'Ask about the lighthouse keeper.' });
    options.push({ key: 'arthur', text: 'Ask about Arthur Bell.' });
    options.push({ key: 'tea', text: 'Drink your tea and listen to the rain.' });
    options.push({ key: 'leave', text: 'Thank her and step back into the rain.' });

    const pick = await ui.choose(options);

    if (pick === 'june') {
      mark('almaJune');
      await ui.say([
        line('alma', 'June Alder. Now there’s a name that knows how to make a room quiet.'),
        line('alma', 'She sang here in the autumn of ’61. The night the clocks were slow — the whole town ran late for a week, and nobody minded.'),
        line('alma', 'She had a blue scarf and a laugh like a struck glass. And a watchmaker who couldn’t take his eyes off her.'),
        line('you', 'Elias Voss.'),
        line('alma', 'You didn’t hear that from me. But yes.'),
        line('alma', 'Then the trains stopped, and she stopped coming. I always thought she left with him.')
      ]);
      ui.toast('A name from the Larkspur', 'June Alder sang under these lamps. She wore blue.', 'photo');
    } else if (pick === 'keeper') {
      mark('almaKeeper');
      await gainClue('keeper');
      await ui.say([
        line('alma', 'The lighthouse keeper? Been up there longer than the road’s been paved.'),
        line('alma', 'Wears an old blue thing, always. Keeps to herself. Comes down for tea once a season and never says her name.'),
        line('you', 'What does she look like?'),
        line('alma', 'Like someone who used to be looked at, and decided she’d rather do the looking.'),
        narr('Alma turns her cup slowly on its saucer.'),
        line('alma', 'Some people wait for a train so long they become the station.')
      ]);
    } else if (pick === 'arthur') {
      mark('arthurKnown');
      unlockPerson('arthur');
      saveState();
      await ui.say([
        line('alma', 'Arthur Bell took his tea black, never sang, and kept every ticket that ever crossed his platform.'),
        line('alma', 'After the line closed he came in every Thursday. Then one Thursday he didn’t.'),
        line('alma', 'He was a good man. Good men can still be afraid of one conversation.'),
        line('you', 'What conversation?'),
        line('alma', 'That’s the part he kept to himself.')
      ]);
    } else if (pick === 'tea') {
      mark('almaTea');
      await ui.say([
        narr('The tea is strong and a little smoky. Outside, rain threads the lamplight.'),
        line('alma', 'There. Now you look like someone who’s been listening.'),
        line('alma', 'Go on with you when you’re ready. The night’s not getting any younger.')
      ]);
    } else {
      loop = false;
      await ui.say([
        line('alma', 'Mind the step. And mind the keeper, if you go up the cliff. She doesn’t bite, but she does remember.'),
        narr('The bell over the Larkspur door is softer than yours. It sounds like a spoon against china.')
      ]);
    }
  }
}

// ---------------------------------------------------------------
// Silas
// ---------------------------------------------------------------
async function talkSilas() {
  if (!state.flags.metSilas) {
    mark('metSilas');
    await ui.say([
      narr('Voss & Sons is a room full of ticking. Every clock disagrees, politely, about the time.'),
      line('silas', 'If it’s a repair, leave it on the bench. If it’s a question, be quick.'),
      line('you', 'It’s about a watch. E. Voss.'),
      narr('The old man’s hands stop moving. The clocks do not.')
    ]);
  } else {
    await ui.say([
      line('silas', 'You again. The clocks are still loud, if that’s what you came for.'),
      narr('He does not look up from the balance wheel in his fingers.')
    ]);
  }

  let loop = true;
  while (loop) {
    const options = [];
    if (!state.flags.silasMemory) options.push({ key: 'elias', text: 'Ask about Elias Voss.' });
    options.push({ key: 'ledger', text: 'Ask about the repair ledger.' });
    options.push({ key: 'arthur', text: 'Ask about Arthur Bell.' });
    options.push({ key: 'leave', text: 'Leave him to his clocks.' });

    const pick = await ui.choose(options);
    if (pick === 'elias') {
      mark('silasMemory');
      unlockPerson('elias');
      saveState();
      await gainClue('silas');
      await ui.say([
        line('silas', 'Elias was my brother. He made the town’s clocks and one watch.'),
        line('silas', 'He made it for a singer. June. He wouldn’t say her name without checking the door first.'),
        line('you', 'What happened to him?'),
        line('silas', 'He took the last 8:17 out of Ember Hollow and never came back.'),
        line('silas', 'He wrote once. *Tell June the clocks are hers.* I never found her. I didn’t know where she’d gone.'),
        line('you', 'She never came back either.'),
        line('silas', 'Then they were both waiting in the same rain, and neither of them knew it.'),
        narr('He sets the balance wheel down very carefully, as though it might hear him.')
      ]);
    } else if (pick === 'ledger') {
      mark('silasLedger');
      await ui.say([
        line('silas', 'The ledger’s on the bench. Every repair he ever made.'),
        line('silas', 'I kept it open at the same page for thirty years. I don’t know what I was waiting for.'),
        line('you', 'Maybe someone to read it.'),
        line('silas', 'Hm. Read it, then.')
      ]);
      ui.toast('The repair ledger', 'It is open on the workbench behind Silas.', 'letter');
    } else if (pick === 'arthur') {
      await ui.say([
        line('silas', 'Arthur Bell stood on that platform every night of his life. He was kind.'),
        line('silas', 'He was also a coward about one thing. I never knew which. I suppose you’ll find out.'),
        line('you', 'You didn’t like him.'),
        line('silas', 'I didn’t say that. I said he was kind.')
      ]);
    } else {
      loop = false;
      await ui.say([
        line('silas', 'Mind the door. It sticks.'),
        narr('A clock behind you chimes the half hour. Another answers a moment later, a little wrong, as if it has been waiting to disagree.')
      ]);
      sound.chime(0.04, 1.1);
    }
  }
}

// ---------------------------------------------------------------
// June
// ---------------------------------------------------------------
async function juneIntro() {
  if (juneIntroRunning) return;
  juneIntroRunning = true;
  try {
    await ui.say([
      narr('The lighthouse room is warm. A lamp turns overhead, slow as a held breath.'),
      narr('A woman sits by the window in a blue shawl she has worn soft. She does not seem surprised to see you.'),
      line('june', 'You’re the shopkeeper. I wondered when you’d come.', { note: 'the keeper' }),
      line('you', 'You knew I would?'),
      line('june', 'I know the watch. It has been waiting. So have I.'),
      line('you', 'You’re June Alder.'),
      line('june', 'I was.'),
      narr('She folds her hands. Outside, the sea keeps its long appointment with the cliff.')
    ]);

    const pick = await ui.choose([
      { key: 'elias', text: 'Ask about Elias Voss.' },
      { key: 'train', text: 'Ask what happened at the station.' }
    ]);

    if (pick === 'elias') {
      await ui.say([
        line('june', 'He made clocks. Good ones. He said a clock was only a promise with a pendulum.'),
        line('june', 'He made one watch. For me. I asked him to fit a heart-stop at 8:17.'),
        line('you', 'Why that minute?'),
        line('june', 'Because it was the minute I was happiest. I thought if the watch stopped there, I wouldn’t have to lose it.'),
        line('june', 'It was a foolish thing to ask. He did it anyway.')
      ]);
    } else {
      await ui.say([
        line('june', 'My mother collapsed the afternoon of the fourteenth. I sent word to Elias that I couldn’t leave.'),
        line('june', 'Then she woke, and she told me to go. So I ran. I reached the platform at 8:17.'),
        line('june', 'The train was already moving. I saw him in the window. He saw me.'),
        line('june', 'I don’t know if he understood that I had come.')
      ]);
    }

    await ui.say([
      line('june', 'Arthur told me Elias had gone. He did not tell me that he had waited.'),
      line('june', 'I gave Arthur the watch because I couldn’t bear to keep it. I thought Elias had chosen to leave without me.'),
      line('you', 'He wrote to Silas. *Tell June the clocks are hers.*'),
      narr('For a moment the only sound is the lamp. Then June lets out a breath she has been holding since 1962.'),
      line('june', 'Then the watch is not a stopped thing at all. It is a letter that took sixty years to arrive.'),
      line('june', 'There are still threads you haven’t tied. I can feel them from here. Go on. I’m good at waiting.')
    ]);

    state.flags.metJune = true;
    state.flags.juneConfession = true;
    gainClue('confession');
    checkFinalReady();
    saveState();
    ui.refreshHUD();
    sound.chime(0.055, 0.82);

    if (!state.flags.finalReady) {
      setTimeout(() => {
        ui.toast('Threads remain', 'Open your journal and tie what you know. The last truth is waiting.', 'thread');
        ui.openJournal('threads');
      }, 700);
    } else {
      setTimeout(() => ui.toast('The last thread', 'You know what happened. Decide what the watch should become.', 'watch'), 600);
    }
  } finally {
    juneIntroRunning = false;
  }
}

async function talkJune() {
  if (state.flags.finished) {
    await juneEpilogue();
    return;
  }
  if (!state.flags.metJune) {
    await juneIntro();
    return;
  }
  if (!state.flags.finalReady) {
    const hint = missingHint();
    await ui.say([
      line('june', 'The watch is still in your pocket. I can hear it not ticking.'),
      line('june', 'There are things you haven’t put together yet. I can wait a little longer.'),
      narr(hint)
    ]);
    ui.toast('Your journal', 'Two threads may still be waiting to meet.', 'thread');
    return;
  }

  await ui.say([
    line('june', 'You’ve come all this way. The watch is yours to decide. I won’t ask for it.'),
    narr('The lamp turns. Rain crosses the glass. In your pocket, the watch is warm.'),
    line('june', 'What will you do with the hour?')
  ]);

  const choice = await ui.choose([
    { key: 'june', text: 'Give it to June. Now.' },
    { key: 'silas', text: 'Take it to Silas, who never stopped waiting either.' },
    { key: 'keep', text: 'Keep it in the shop, with its story.' },
    { key: 'station', text: 'Leave it at the station, at 8:17.' }
  ]);

  if (choice === 'june') {
    await ui.say([
      narrationOrLine('june', 'June holds the watch in both hands for a long time. Then she opens the little catch and winds the crown.'),
      line('june', 'Sixty years. And it only needed someone to listen.'),
      narr('The hands move. 8:18. 8:19. The room fills with a sound like a very small heart deciding to go on.')
    ]);
    api.playEnding?.('june');
  } else if (choice === 'silas') {
    await ui.say([
      narr('You wrap the watch in a clean cloth and put it in your coat.'),
      line('june', 'Silas. He’ll pretend not to want it.'),
      line('you', 'I know.'),
      line('june', 'Good. Let him pretend.'),
      narr('She turns back to the window, and the lamp keeps its slow watch over the sea.')
    ]);
    api.playEnding?.('silas');
  } else if (choice === 'keep') {
    await ui.say([
      narr('You close your hand around the watch. It is warm, and quiet, and not quite finished.'),
      line('june', 'A shop is a good place for a thing like that.'),
      line('you', 'Come and see it. Thursdays.'),
      line('june', 'Thursdays. Arthur’s day.'),
      narr('She almost smiles. The lamp turns. The rain lets up, a little, as if it has heard enough.')
    ]);
    api.playEnding?.('keep');
  } else {
    await ui.say([
      narr('You put the watch in your pocket and button your coat.'),
      line('june', 'The station bench. The one under the clock.'),
      line('you', 'You knew.'),
      line('june', 'Some places keep an hour for you whether you come back or not.'),
      narr('The lamp turns. Outside, the path down the cliff is dark and certain.')
    ]);
    api.playEnding?.('station');
  }
}

async function juneEpilogue() {
  const ending = state.flags.ending;
  const lines = {
    june: [
      line('june', 'The watch is on my mantel. It keeps excellent time, and terrible opinions.'),
      line('you', 'That sounds like a watchmaker’s influence.'),
      line('june', 'It sounds like happiness. I’ve had to get used to the noise.')
    ],
    silas: [
      line('june', 'Silas came up on Sunday. He brought the watch and didn’t say a word about it.'),
      line('june', 'We sat here until the lamp came on. It was enough.')
    ],
    keep: [
      line('june', 'I came to see the watch. Your card made me cry in the middle of your shop.'),
      line('you', 'I’m sorry.'),
      line('june', 'Don’t be. It was a good cry. The kind that leaves the windows clean.')
    ],
    station: [
      line('june', 'The station clock is working again. I heard it from the cliff path.'),
      line('june', 'Some things only need to be put down.')
    ]
  };
  await ui.say(lines[ending] || [narr('June watches the lamp turn. The evening is very quiet.')]);
}

function narrationOrLine(who, text) {
  return { who, text };
}

function missingHint() {
  if (!state.flags.letterRead) return 'The stationmaster’s desk is still locked in its own way. There is a letter no one sent.';
  if (!state.flags.metSilas) return 'Elias had a brother. Silas still winds every clock in Voss & Sons.';
  if (!state.flags.metAlma) return 'The Larkspur keeps the town’s older songs, and Alma Finch remembers every one.';
  if (!hasDeduction('missed')) return 'The timetable and the station log disagree about a train that waited four minutes.';
  if (!hasDeduction('arthurKept')) return 'A letter and a brother’s memory. Arthur kept more than tickets.';
  return 'Open your journal. Two threads are waiting to meet.';
}

// ---------------------------------------------------------------
// The shop counter and the station desk
// ---------------------------------------------------------------
async function shopDrawer() {
  if (state.flags.hasKey) {
    await ui.say([
      narr('String, receipt books, a tin of mismatched buttons. The key is in your coat pocket now.'),
      narr('The station is at the end of Lantern Row, under the old clock tower.')
    ]);
    return;
  }
  await ui.say([
    narr('The drawer sticks, then gives. Inside: string, a receipt book, a tin of buttons that have outlived their coats.'),
    narr('At the back, a small brass key on a paper tag. In Arthur’s small, exact hand: *EMBER HOLLOW STATION. In case someone comes asking.*'),
    line('you', 'Someone did come asking.'),
    narr('You put the key in your pocket. The shop feels a little larger, or the evening a little smaller.')
  ]);
  mark('hasKey');
  mark('keyFound');
  saveState();
  ui.noteStateChange();
  ui.toast('A small brass key', 'Ember Hollow Station. In case someone comes asking.', 'lock');
  sound.chime(0.04, 1.0);
}

async function shopCabinet() {
  if (state.flags.finished && state.flags.ending) {
    const e = ENDINGS[state.flags.ending];
    await ui.say([
      narr('The cabinet holds the small things people have trusted you with.'),
      narr(e.shelf)
    ]);
  } else {
    await ui.say([
      narr('A glass cabinet of other people’s memories: a christening spoon, a dance card, a single earring, a stone with a hole worn through it.'),
      narr('Each one has a card. Most of the cards are in your handwriting.'),
      line('you', 'A watch would look right here. If it ever decides to stay.')
    ]);
  }
}

async function stationDesk() {
  if (!state.flags.hasKey) {
    await ui.say([
      narr('The stationmaster’s desk has a small brass lock. It is not a strong lock. It is simply a question of having the right small thing.'),
      line('you', 'The drawer at the shop. Mara said there was a key.')
    ]);
    return;
  }
  if (!state.flags.letterRead) {
    await ui.say([
      narr('The key turns. The drawer is full of the things Arthur Bell could not throw away.'),
      narr('A bundle of timetables. A tin of pencil stubs. An envelope with no stamp, folded and unfolded until the crease went soft.'),
      narr('It is addressed to June.')
    ]);
    await openEvidenceAndWait('letter');
    state.flags.letterRead = true;
    state.flags.arthurKnown = true;
    unlockPerson('arthur');
    saveState();
    await ui.say([
      narr('You fold the letter closed along its old crease. It does not want to stay flat.'),
      line('you', 'He told Elias she wasn’t coming. He never told her Elias waited.'),
      line('you', 'And then he kept the watch for sixty years.'),
      narr('The station clock above the bench is silent. It has been silent since the line closed.')
    ]);
    ui.noteStateChange();
  } else {
    await openEvidenceAndWait('letter');
    await ui.say([
      narr('The letter is where you left it. Some things are heavier the second time.')
    ]);
  }
}

async function lighthouseDoor() {
  if (state.flags.finished) {
    await api.go?.('lighthouse');
    return;
  }
  if (!hasDeduction('keeperIsJune')) {
    await ui.say([
      narr('The lighthouse door is old blue wood, bleached by salt. You raise your hand, then stop.'),
      narr('You do not yet know what to say. The case is still a handful of loose threads.'),
      line('you', 'Blue wool. A keeper nobody names. A lighthouse.'),
      narr('Tie them together in your journal first.')
    ]);
    ui.toast('The cliff path', 'Tie the blue wool to the keeper before you knock.', 'thread');
    return;
  }
  await api.go?.('lighthouse');
}

// ---------------------------------------------------------------
// Keepsakes
// ---------------------------------------------------------------
const KEEPSAKE_LINES = {
  boat: [
    narr('A paper boat, folded from a tram ticket. It has sailed exactly one gutter and been entirely happy about it.'),
    narr('You tuck it into your coat pocket. It seems rude to leave it to sink.')
  ],
  button: [
    narr('A blue button under the corner table. Someone sewed it back on three times before giving up.'),
    narr('You put it in your pocket with the other small things. The Larkspur hums around you.')
  ],
  gear: [
    narr('A practice gear on the workshop floor, one tooth cut a little too small.'),
    narr('Silas has swept around it for thirty years. You pick it up. He pretends not to notice.')
  ],
  violet: [
    narr('A pressed violet under the station bench, from the summer the trains stopped.'),
    narr('It has kept its colour out of stubbornness. You slide it into your journal.')
  ],
  glass: [
    narr('A piece of sea glass on the cliff path. Green, worn soft by sixty years of tide.'),
    narr('It has made itself kind instead of sharp. You close your hand around it.')
  ]
};

async function takeKeepsake(id) {
  if (state.keepsakes.includes(id)) {
    const k = KEEPSAKES[id];
    await ui.say([narr(`You turn ${k ? k.title.toLowerCase() : 'the small thing'} over in your hand. It has already found its place in the shop.`)]);
    return;
  }
  const added = ui.noteKeepsake(id);
  if (!added) return;
  sound.paper();
  await ui.say(KEEPSAKE_LINES[id] || [narr('You put the little thing in your pocket.')]);
}

// ---------------------------------------------------------------
// Looking at things
// ---------------------------------------------------------------
const LOOKS = {
  // Lantern Row
  'look:notice': [narr('A rain-soaked notice: *EMBER HOLLOW AUTUMN FAIR — CANCELLED DUE TO WEATHER (AND THE WEATHER SINCE).* Someone has drawn a small cat in the corner.')],
  'look:signpost': [
    narr('The signpost points to the station, the cliff path, and — in smaller letters — *THE LITTLE THINGS.*'),
    narr('You painted that last one yourself. It is already peeling.')
  ],
  'look:puddle': [narr('The puddle holds the whole street upside down: lamps, rain, a paper boat, your own uncertain face.')],
  'look:shopwindow': [narr('Your window: one warm lamp, a chair, a sleeping cat, and the small card that says *OPEN.* It looks like somewhere a person could come in out of the rain.')],
  'look:teawindow': [narr('Through the steamed glass: Alma’s lamps, a cake under a glass dome, and a table where two people might sit for a long time.')],
  'look:clockwindow': [narr('Voss & Sons. Every clock in the window says something different. One of them, very quietly, is right.')],

  // Station
  'look:stationclock': [
    narr('The station clock is stopped at 8:17. Its hands are stiff with old grease.'),
    line('you', 'Arthur wound it every night for forty years. Someone stopped winding it when he did.')
  ],
  'look:bench': [
    narr('A wooden bench, worn smooth where generations of people have waited.'),
    narr('There is a square of pale paint missing from the wall behind it, where a timetable used to hang.')
  ],
  'look:luggage': [narr('Left luggage: a trunk with a ship’s sticker, a hatbox tied with string, a suitcase that has been to more places than anyone in Ember Hollow.')],
  'look:notices': [narr('A notice board of small vanished things. *LOST: one glove, grey. FOUND: one glove, grey. If yours, please describe.* Somebody has pinned a pressed violet to the corner.')],

  // Cliff
  'look:sea': [narr('The sea is grey and patient. Rain stipples it into a million small circles, each one gone before it is finished.')],
  'look:light': [narr('The lighthouse lamp turns behind the glass — a slow, warm hand stirring the dark. Someone is up there. Someone has been up there a long time.')],

  // Shop
  'look:cat': [
    narr('Moth opens one eye. It is the colour of old brass.'),
    narr(state.flags.watchInspected ? 'He sneezes at the watch, then looks at you as though you have missed something obvious.' : 'He stretches, steps onto the counter, and sits precisely beside the watch. He does not explain why.')
  ],
  'look:shopWindow': [narr('Rain runs down the window in slow threads. Lantern Row is soft and bright through it — a world made of amber and water.')],
  'look:shopShelves': [narr('Teapots, camera parts, a jar of keys, a doll’s house chair, a music box that only plays if you are not listening. All of them waiting for someone.')],
  'look:gramophone': [narr('The gramophone is playing something very old and very quiet. You are not sure you turned it on.'), narr('Moth has opinions about the music. He keeps them to himself.')],

  // Tea house
  'look:cakes': [narr('Seed cake, lemon cake, a dark ginger loaf under glass. Alma cuts them thin and fills the plate. Nobody leaves the Larkspur hungry.')],
  'look:fire': [narr('The fire is small and well behaved. It smells of applewood and last winter.')],
  'look:teaWindow': [narr('Rain beads on the glass. Beyond it, the street lamps are golden smears.')],
  'look:teatable': [narr('The corner table has two chairs. One of them is pulled out, as if someone has just left. A blue button has rolled under the leg.')],

  // Clock workshop
  'look:workbench': [narr('The workbench is covered in tiny screws, brass shavings, and a pair of tweezers older than you are. Everything has a place. Nothing is quite in it.')],
  'look:clockwall': [narr('You listen. Under the ticking there is a lower sound — the whole room breathing in time.')],
  'look:longcase': [narr('A longcase clock with a moon phase and a painted ship. It is set to a time that does not exist. Silas winds it anyway.')],
  'look:clockWindow': [narr('Rain on the workshop window. The clocks do not care. They have their own weather.')],

  // Lighthouse
  'look:lens': [narr('The great lens is a mountain of glass and brass. When the lamp passes, the whole room fills with a slow green-gold light.')],
  'look:juneDesk': [narr('June’s desk: a logbook of tides, a pair of reading glasses, a photograph of the Larkspur folded along the crease.')],
  'look:lightWindow': [narr('From up here the sea is enormous and the town is a handful of yellow windows. Rain moves across the glass like something alive.')],
  'look:shawl': [narr('A blue shawl over the chair back. The colour of a scarf in an old photograph. It has been mended many times.')],
  'look:junePhoto': [
    narr('A photograph on the wall: a younger June on the Larkspur stage, caught mid-song, one hand raised.'),
    narr('Someone has written beneath it in pencil: *The night the clocks were slow.*')
  ]
};

// ---------------------------------------------------------------
// Small talk helpers
// ---------------------------------------------------------------
async function talk(who) {
  if (who === 'mara') return talkMara();
  if (who === 'alma') return talkAlma();
  if (who === 'silas') return talkSilas();
  if (who === 'june') return talkJune();
  return ui.say([narr('There is no one there.')]);
}

export { talk, LOOKS };
