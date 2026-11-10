// ---------------------------------------------------------------
// THE LITTLE THINGS — story data
// ---------------------------------------------------------------

export const WATCH_DETAILS = [
  {
    id: 'engraving',
    label: 'The engraving on the back',
    clue: 'engraving',
    hotspot: { x: 50, y: 50 },
    caption: 'For June. 8:17. E. The letters are worn smooth at the edges, as though a thumb has worried them for years.'
  },
  {
    id: 'maker',
    label: "The maker's mark",
    clue: 'maker',
    hotspot: { x: 66, y: 57 },
    caption: 'Inside the case: a tiny stamp of a clock face and the letters E.V. Beneath it, in smaller type: VOSS & SONS.'
  },
  {
    id: 'heartstop',
    label: 'The heart-stop lever',
    clue: 'heartstop',
    hotspot: { x: 46, y: 43 },
    caption: 'A small steel lever tucked beneath the balance. A heart-stop. A watchmaker fits one when someone wants time to stop at a chosen minute.'
  },
  {
    id: 'wool',
    label: 'The chain',
    clue: 'wool',
    hotspot: { x: 50, y: 84 },
    caption: 'A strand of blue wool is caught in the last link, stiff with sea salt. A fleck of pale blue paint clings beside it.'
  }
];

export const CLUES = {
  engraving: {
    title: 'For June. 8:17. E.',
    short: 'An engraving on the watch back.',
    text: 'On the back of the watch, beneath a border of tiny leaves: “For June. 8:17. E.” The letters are worn soft by a thumb.',
    source: 'The watch',
    icon: 'engraving'
  },
  maker: {
    title: 'E. Voss of Voss & Sons',
    short: 'The maker’s mark inside the case.',
    text: 'A stamped clock face and the initials E.V., with VOSS & SONS beneath. Someone in Ember Hollow made this watch — and signed it.',
    source: 'The watch',
    icon: 'gear'
  },
  heartstop: {
    title: 'A heart-stop, fitted',
    short: 'The movement was altered to stop at a chosen minute.',
    text: 'Beneath the balance wheel sits a heart-stop lever. It is not damage. Someone paid a watchmaker to make the watch stop at exactly 8:17.',
    source: 'The watch',
    icon: 'clock'
  },
  wool: {
    title: 'Blue wool and sea salt',
    short: 'A strand caught in the chain.',
    text: 'Caught in the last link of the chain: a thread of blue wool, stiff with salt, and a fleck of pale blue paint. The watch has been near the sea — and near someone who wore blue.',
    source: 'The watch chain',
    icon: 'thread'
  },
  ledger: {
    title: 'The repair ledger',
    short: 'One line, underlined twice.',
    text: '14 Oct 1962 — J.A.’s watch. Fit heart-stop at 8:17. She asked me to keep this hour, whatever happens. — E.V.',
    source: 'Voss & Sons',
    icon: 'letter'
  },
  photo: {
    title: 'June at the Larkspur',
    short: 'A photograph in a brass frame.',
    text: 'A young woman sings beneath the tea house lamps. On the back, in pencil: “June Alder, autumn 1961. The night the clocks were slow.” She is wearing a blue scarf.',
    source: 'The Larkspur',
    icon: 'photo'
  },
  keeper: {
    title: 'The keeper of the light',
    short: 'Someone has lived in the lighthouse for years.',
    text: 'Alma says the lighthouse keeper almost never comes to town. “Wears an old blue thing, always. Keeps to herself.” Nobody in Ember Hollow seems to know her name.',
    source: 'Alma Finch',
    icon: 'lighthouse'
  },
  timetable: {
    title: 'The 8:17 train',
    short: 'The last evening train out of Ember Hollow.',
    text: 'Ember Hollow & Coastal Railway. The final evening service left at 8:17. The line closed the following spring. The 8:17 was the last train anyone in town remembers waiting for.',
    source: 'Ember Hollow Station',
    icon: 'train'
  },
  log: {
    title: 'Station log, 14 Oct 1962',
    short: 'One passenger boarded. One did not.',
    text: '8:17 service delayed four minutes. Passenger E. Voss boarded. J. Alder did not. Stationmaster A. Bell noted: “Platform empty at 8:21. Rain.”',
    source: 'Ember Hollow Station',
    icon: 'train'
  },
  letter: {
    title: 'Arthur’s unsent letter',
    short: 'A confession in the stationmaster’s desk.',
    text: '“Dear June — You asked me to tell him you weren’t coming. I did. I did not tell you that he waited until the guard pulled him aboard. I did not tell you he left something for you. I have kept it. I am sorry. — A.”',
    source: 'The stationmaster’s desk',
    icon: 'letter'
  },
  silas: {
    title: 'Silas’s memory',
    short: 'Elias left on the 8:17 and never came back.',
    text: 'Silas says Elias boarded the last 8:17 train and never returned to Ember Hollow. He wrote once: “Tell June the clocks are hers.” Silas never told her. He did not know where she had gone.',
    source: 'Silas Voss',
    icon: 'gear'
  },
  confession: {
    title: 'June’s confession',
    short: 'She reached the station at 8:17. The train was leaving.',
    text: 'June’s mother collapsed the afternoon of 14 October. June asked Arthur to tell Elias she could not leave — then changed her mind and ran for the station. She arrived at 8:17. The train was already moving. She gave Arthur the watch because she could not bear to keep it.',
    source: 'June Alder',
    icon: 'lighthouse'
  }
};

export const DEDUCTIONS = {
  eliasJune: {
    a: 'engraving',
    b: 'maker',
    title: 'A watch made for June',
    text: 'E. Voss is Elias Voss. He made this watch for June Alder — and signed it like a promise.'
  },
  chosen: {
    a: 'heartstop',
    b: 'ledger',
    title: 'Time, stopped on purpose',
    text: 'The heart-stop was June’s own request. The watch was made to stop at 8:17, whatever happened.'
  },
  missed: {
    a: 'timetable',
    b: 'log',
    title: 'The train she missed',
    text: 'June reached the platform at 8:17, exactly as the last train was leaving. Elias was already aboard.'
  },
  keeperIsJune: {
    a: 'wool',
    b: 'keeper',
    title: 'The woman in blue',
    text: 'Sea salt, blue wool, a lighthouse, a keeper nobody names. The keeper is June Alder.'
  },
  arthurKept: {
    a: 'letter',
    b: 'silas',
    title: 'The thing your grandfather kept',
    text: 'Arthur told Elias that June was not coming — and never told June that Elias had waited. He kept the watch for sixty years.'
  },
  return: {
    a: 'confession',
    b: 'engraving',
    title: 'The hour that waited',
    text: 'The watch has waited sixty years to be returned to June. The only question left is how.'
  }
};

export const PEOPLE = {
  mara: {
    name: 'Mara Bell',
    role: 'A granddaughter',
    portrait: 'mara',
    unlock: () => true,
    bio: 'She came in out of the rain carrying her grandfather’s watch and a question she could not put down. She has his careful hands and none of his silence.'
  },
  arthur: {
    name: 'Arthur Bell',
    role: 'Stationmaster, 1931–1972',
    portrait: 'arthur',
    unlock: (s) => s.flags.arthurKnown || s.flags.hasKey,
    bio: 'Mara’s grandfather. He kept every ticket, every timetable, every small thing that passed through Ember Hollow Station. He said almost nothing about any of it.'
  },
  alma: {
    name: 'Alma Finch',
    role: 'The Larkspur Tea House',
    portrait: 'alma',
    unlock: (s) => s.flags.metAlma,
    bio: 'She has poured tea in Ember Hollow for forty years and remembers every song sung under her lamps. She is kind, but she does not sand the edges off a story.'
  },
  silas: {
    name: 'Silas Voss',
    role: 'Clockmaker',
    portrait: 'silas',
    unlock: (s) => s.flags.metSilas,
    bio: 'Elias’s younger brother. He runs Voss & Sons alone now. He still winds every clock in the shop, even the ones that are not for sale.'
  },
  elias: {
    name: 'Elias Voss',
    role: 'Clockmaker, 1934–1998',
    portrait: 'elias',
    unlock: (s) => s.flags.metSilas,
    bio: 'He made the town’s clocks and one watch. He left Ember Hollow on the 8:17 train and never came back, though he wrote once to say the clocks were June’s.'
  },
  june: {
    name: 'June Alder',
    role: 'The keeper of the light',
    portrait: 'june',
    unlock: (s) => s.peopleUnlocked?.june || s.flags.metJune,
    bio: (s) => s.flags.metJune
      ? 'She sang at the Larkspur once. Then she stayed, kept the light, and waited sixty years for a train she thought had left without her.'
      : 'A singer at the Larkspur, once. She wore blue and kept time badly. Alma says she left town the night of the long rain.'
  }
};

export const KEEPSAKES = {
  boat: {
    title: 'A paper boat',
    text: 'Folded from a tram ticket. It has sailed exactly one gutter, and been entirely happy about it.',
    where: 'Lantern Row, in a puddle',
    glyph: 'boat'
  },
  button: {
    title: 'A blue button',
    text: 'From a coat that no longer fits anyone. Someone sewed it back on three times before giving up.',
    where: 'Under a table at the Larkspur',
    glyph: 'button'
  },
  gear: {
    title: 'A practice gear',
    text: 'Elias cut it a tooth too small. Silas has swept around it for thirty years without once picking it up.',
    where: 'Voss & Sons, by the workbench',
    glyph: 'gear'
  },
  violet: {
    title: 'A pressed violet',
    text: 'Picked from the platform garden the summer the trains stopped. It has kept its colour out of stubbornness.',
    where: 'Ember Hollow Station',
    glyph: 'violet'
  },
  glass: {
    title: 'A piece of sea glass',
    text: 'Green, worn soft. Sixty years of tide have made it kind instead of sharp.',
    where: 'The cliff path',
    glyph: 'shell'
  }
};

export const ENDINGS = {
  june: {
    key: 'june',
    title: 'The Hour Returned',
    kicker: 'An ending',
    short: 'You gave the watch back to June.',
    text: `June holds the watch in both hands for a long time. Then she opens the little catch, winds the crown, and sets the hands to the true time. It begins to tick — quiet, stubborn, alive.

“Sixty years,” she says. “And it only needed someone to listen.”

A week later she comes down the cliff path for tea. Mara meets her at the Larkspur. They talk until the lamps are lit, and Arthur is spoken of kindly, because the truth is kinder than the silence was.

The watch sits on June’s mantel, keeping a new hour.`,
    shelf: 'A length of blue thread, pinned above the counter.',
    glyph: 'thread',
    color: '#6f92ab'
  },
  silas: {
    key: 'silas',
    title: 'The Clockmaker’s Brother',
    kicker: 'An ending',
    short: 'You gave the watch to Silas.',
    text: `Silas does not say thank you. He clears a space on the workbench, lays the watch under the lamp, and begins to take it apart. By morning it is running.

“Elias never could regulate a balance wheel,” he mutters, and wipes his eyes with the back of his hand.

On Sunday he carries it up the cliff path. He and June sit by the lamp and do not speak much. They do not need to. When he comes back, every clock in Voss & Sons chimes at once — and Silas lets them.`,
    shelf: 'A small brass gear, set on the shelf beside the register.',
    glyph: 'gear',
    color: '#b98a52'
  },
  keep: {
    key: 'keep',
    title: 'The Keeper of Little Things',
    kicker: 'An ending',
    short: 'You kept the watch, and its story, in the shop.',
    text: `You set the watch in the glass cabinet with a card: For June. 8:17. E. — and beneath it, the truth.

People begin to come in to see it. They bring their own small things: a key, a letter, a button. You listen. You keep.

June visits on Thursdays. Silas comes on Sundays. Mara works the counter on rainy afternoons. The shop becomes what it always was — a place where lost things wait to be found.

Some hours are not for spending. Some are for keeping.`,
    shelf: 'The watch, under glass, with its story on a small card.',
    glyph: 'clock',
    color: '#e8b06a'
  },
  station: {
    key: 'station',
    title: 'The Last Platform',
    kicker: 'An ending',
    short: 'You left the watch at the station, at 8:17.',
    text: `At 8:17 you place the watch on the bench where June waited. The station clock is silent. You leave it there, and you go home.

In the morning the watch is gone. On the bench: a single blue thread, and a pressed violet.

The station clock begins to work again. No one winds it. Alma says it is the salt air. Silas says it is the ghost of a good repair.

You know better. Some things only need to be put down.`,
    shelf: 'A pressed violet and a blue thread, tucked behind the till.',
    glyph: 'violet',
    color: '#8b9a7c'
  }
};

export const EVIDENCE = {
  photo: {
    title: 'The Larkspur, 1961',
    meta: 'Photograph<br>Alma Finch’s frame',
    lede: 'A young woman sings beneath the tea house lamps. Everything in the photograph is gold except her scarf.',
    clue: 'photo',
    kind: 'photo'
  },
  ledger: {
    title: 'Repair ledger',
    meta: 'Voss & Sons<br>October 1962',
    lede: 'The pages smell of oil and pipe tobacco. One line has been underlined twice.',
    clue: 'ledger',
    kind: 'ledger'
  },
  timetable: {
    title: 'Ember Hollow & Coastal Railway',
    meta: 'Station board<br>Autumn 1962',
    lede: 'The last evening service. Someone has drawn a small circle around one line in pencil.',
    clue: 'timetable',
    kind: 'timetable'
  },
  log: {
    title: 'Station log',
    meta: 'Ember Hollow Station<br>14 October 1962',
    lede: 'The stationmaster’s handwriting is small and exact. On this page it is also a little uneven.',
    clue: 'log',
    kind: 'log'
  },
  letter: {
    title: 'A letter, never sent',
    meta: 'The stationmaster’s desk<br>Undated',
    lede: 'The envelope has no stamp. It has been opened and folded shut so many times the crease has gone soft.',
    clue: 'letter',
    kind: 'letter'
  }
};

export const SCENE_INFO = {
  shop: { name: 'The Little Things', sub: 'Your shop · Ember Hollow' },
  street: { name: 'Lantern Row', sub: 'Ember Hollow · 6:52 p.m.' },
  tea: { name: 'The Larkspur', sub: 'Tea & small comforts' },
  clock: { name: 'Voss & Sons', sub: 'Clockmakers since 1902' },
  station: { name: 'Ember Hollow Station', sub: 'The last stop before the sea' },
  cliff: { name: 'The Cliff Path', sub: 'Salt, gorse, and weather' },
  lighthouse: { name: 'The Light', sub: 'The keeper’s room' }
};

export const OBJECTIVES = {
  inspect: 'Examine the watch Mara left on the counter.',
  talkMara: 'Ask Mara what she remembers about her grandfather.',
  lookAround: 'Look for June in the town. Try the Larkspur and Voss & Sons.',
  key: 'Mara mentioned a spare key. Search the shop counter.',
  station: 'Search the old station for the night of the 8:17 train.',
  keeper: 'Find the lighthouse keeper. Tie the threads first.',
  june: 'Visit the lighthouse on the cliff path.',
  tie: 'Tie the remaining threads in your journal. Some truths need to be seen together.',
  decide: 'Decide what should become of the watch.',
  post: 'The shop is open. The rain has eased. Some things are still waiting to be found.'
};
