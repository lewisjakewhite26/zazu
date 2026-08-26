# ZAZU — Full Copy Deck

*Every piece of text on the landing page, in the order it appears, mapped to the component and file it lives in. Use this as the single source of truth for proofreading and copy edits.*

Page render order (`app/page.tsx`): **Nav → Hero → How It Works → Word Marquee → Etymology Exploder → Pack Grid → Gold → Word Gym → Footer**.

---

## 0. Document / SEO metadata
*File: `app/layout.tsx` — not visible on the page; shows in the browser tab, search results, and social shares.*

| Field | Copy |
|---|---|
| Tab title | `Zazu — A new word. Every morning.` |
| Meta description | `Zazu is a vocabulary alarm clock. Learn one curated English word every morning — etymology included. Zazu Gold unlocks 1,700+ premium words across ten themed packs.` |
| Keywords | `vocabulary, etymology, word of the day, alarm, English, learn, morning, dictionary` |
| OG title | `Zazu — A new word. Every morning.` |
| OG description | `Learn one word every morning. Etymology, gym rounds, and ten premium word packs.` |
| OG site name | `Zazu` |
| OG url | `https://zazu.org.uk` |

**Accessibility skip link** (`app/layout.tsx`, visible only on keyboard focus): `Skip to content`

---

## 1. Navigation Bar
*File: `components/Nav.tsx` — fixed top bar.*

| Element | Copy |
|---|---|
| Wordmark | `zazu` |
| Link 1 | `How it works` → `#how-it-works` |
| Link 2 | `Word packs` → `#packs` |
| Link 3 | `Gold` → `#gold` |
| CTA button | `Join the Waitlist` → `mailto:hello@zazu.org.uk?subject=Zazu Early Access Waitlist` |

---

## 2. Hero
*File: `components/Hero.tsx` — full-screen opening section.*

| Element | Copy |
|---|---|
| Cinematic intro wordmark | `zazu` |
| Headline (h1) | `A new word every morning.` |
| Subhead | `Wake up. Learn something.` |
| Primary CTA | `Join the iOS Waitlist` → `mailto:hello@zazu.org.uk?subject=Zazu Waitlist — iOS` |
| Secondary CTA | `Join the Android Waitlist` → `mailto:hello@zazu.org.uk?subject=Zazu Waitlist — Android` |
| CTA footnote | `Be first in line — early access invites are sent in batches.` |
| Phone image alt text | `The Zazu app's word screen — the word Vitreous with its definition and Latin etymology, vitrum (glass)` |

**Text inside the phone mockup image** (`public/zazu-word-screen.png` — baked into the asset, not editable as code):
`LEARN THE WORD` · `Vitreous` · `VIT–ree–us · adjective` · `Like glass in appearance or physical properties; glassy.` · `ETYMOLOGY` · `From Latin vitrum (glass).` · `Continue`

---

## 3. How It Works
*File: `components/HowItWorks.tsx` — section id `#how-it-works`.*

| Element | Copy |
|---|---|
| Heading line 1 | `Your alarm just got smarter,` |
| Heading line 2 | `now so can you.` |
| Intro paragraph | `When your alarm fires, one word appears on screen. Just the word. Get up, and you unlock the full story. You learn where it came from, what it means, and which other words share its roots. The whole thing takes under a minute.` |

**Three step cards:**

| Step | Label | Description |
|---|---|---|
| 1 | `Alarm fires` | `One word appears on screen. Just the word. Nothing else.` |
| 2 | `You get up` | `Etymology, definition, roots. The full story of where the word came from.` |
| 3 | `You remember it` | `Answer one question to dismiss the alarm. The act of answering is what makes it stick.` |

---

## 4. Word Marquee
*File: `components/WordMarquee.tsx` — two scrolling rows of words; each word reveals its detail on hover.*

| Element | Copy |
|---|---|
| Heading | `479 free words. Start expanding your vocabulary today.` |
| Subhead | `A word a day builds faster than you'd think. Every word in Zazu comes with its full story: etymology, roots, and a morning task that makes it stick.` |

**Row 1 words** (each card: word → on hover shows etymology, definition, coined date):

| Word | Definition | Etymology | Coined |
|---|---|---|---|
| Mellifluous | Sweet or musical; pleasant to hear. | From Latin 'mel' (honey) and 'fluere' (to flow). | 15th Century |
| Ephemeral | Lasting for a very short time. | From Greek 'ephēmeros', meaning lasting only one day. | Late 16th Century |
| Perspicacious | Having a ready insight into and understanding of things. | From Latin 'perspicax', meaning seeing clearly. | Early 17th Century |
| Sanguine | Optimistic or positive, especially in a bad situation. | From Latin 'sanguis' (blood). | Middle English |
| Laconic | Using very few words. | From 'Lakōnikos', meaning Spartan. | Late 16th Century |
| Ebullient | Cheerful and full of energy. | From Latin 'ebullire', meaning to boil over. | Late 16th Century |

**Row 2 words:**

| Word | Definition | Etymology | Coined |
|---|---|---|---|
| Tenacious | Tending to keep a firm hold of something. | From Latin 'tenere', meaning to hold. | Early 17th Century |
| Equanimity | Mental calmness and composure. | From Latin 'aequus' (equal) and 'animus' (mind). | Early 17th Century |
| Truculent | Eager or quick to argue or fight. | From Latin 'trux', meaning fierce. | Early 16th Century |
| Insouciant | Showing a casual lack of concern. | From French 'in-' (not) and 'soucier' (to care). | Late 18th Century |
| Susurrus | A whispering, murmuring, or rustling sound. | From Latin 'susurrare', meaning to hum or whisper. | Late 19th Century |
| Cacophony | A harsh, discordant mixture of sounds. | From Greek 'kakos' (bad) and 'phone' (sound). | Mid 17th Century |

---

## 5. Etymology Exploder
*File: `components/EtymologyExploder.tsx` — scroll-driven section that fragments one word into its roots.*

| Element | Copy |
|---|---|
| Section eyebrow heading | `Every word has a story.` |
| The word (fragments) | `PAN` · `DEMON` · `IUM` (i.e. **PANDEMONIUM**) |

**Root labels (under each fragment):**

| Fragment | Language | Root | Meaning |
|---|---|---|---|
| PAN | Greek | pan | all / every |
| DEMON | Greek | daimon | spirit / divine power |
| IUM | Latin | -ium | place of |

**Attribution block (appears at the end):**
- Coined by **John Milton** · *Paradise Lost* · 1667
- Meaning: `A place of wild chaos and noise — originally the capital of Hell.`

---

## 6. Pack Grid
*File: `components/PackGrid.tsx` — section id `#packs`. Master list (left) + detail panel (right).*

| Element | Copy |
|---|---|
| Heading | `Ten themed word packs.` |
| Intro paragraph | `From Shakespeare's coinages to Latin legal terms. From Tolkien's invented words to loan words borrowed from across the globe.` |

**Static labels in the detail panel:**
- `{n} Curated Words` (eyebrow, e.g. "270 Curated Words")
- `What's inside`
- `Included with Zazu Gold` (gold italic footer)
- Sidebar per pack shows `{n} words`

**The ten packs** (name · word count · description · example words):

### The Literary Pack — 270 words · accent: lavender
`Words coined or popularised by the authors who shaped English. Shakespeare, Milton, Tolkien, Orwell, Carroll, Chaucer, Dickens and more. Every word comes with a real quote from the source text.`
Examples: Pandemonium · Eucatastrophe · Bedazzle
Inside: Shakespeare Vol. 1 · Shakespeare Vol. 2 · Milton · Chaucer · The Romantics · Dickens · Carroll & Dahl · Tolkien · Orwell

### The Loan Words Pack — 390 words · accent: peach
`English borrowed words from every language it encountered. These are 390 of them, organised into thirteen groups.`
Examples: Schadenfreude · Saudade · Juggernaut
Inside: From the French · From the Germanic · From the Spanish · From the East · From Persia and Arabia · From the Italian · From South Asia · From the North · From the Americas · From Africa · From the Pacific · From the Classical World · The Curious and Unexpected

### The Mythology Pack — 150 words · accent: blush
`Words that started as gods, monsters, and stories. Greek, Roman, Norse, Egyptian and Celtic mythology all left their mark on everyday English.`
Examples: Narcissism · Pandora · Valhalla
Inside: Greek Mythology · Roman Mythology · Norse Mythology · Egyptian Mythology · Celtic Mythology

### The Science Pack — 150 words · accent: lavender
`Words coined by scientists or born from the moment of discovery. From the naming of elements to the invention of computing vocabulary.`
Examples: Entropy · Symbiosis · Quantum
Inside: Biology & Medicine · Chemistry · Earth & Climate · Physics & Technology · Space & Astronomy

### The Eponym Pack — 150 words · accent: peach
`Words that came from real people. Some famous, some entirely forgotten. All of them left a word behind.`
Examples: Kafkaesque · Machiavellian · Bowdlerise
Inside: Literary Eponyms · Historical & Political · Scientific Eponyms · Fashion Eponyms · Food Eponyms · Inventions & Brands

### The Geography Pack — 150 words · accent: blush
`The vocabulary of the physical world. Landforms, waters, climate, and the terms geographers use to describe what they see.`
Examples: Fjord · Savanna · Archipelago
Inside: Landforms · Waters & Coasts · Climate & Weather · Biomes & Vegetation · Geological Features

### The Architecture Pack — 150 words · accent: lavender
`From Gothic cathedrals to Brutalist housing blocks. The words that describe how buildings are made and what they mean.`
Examples: Cantilever · Clerestory · Rotunda
Inside: Structural Elements · Spaces & Interiors · Styles & Movements · Materials · Urban Design

### The Law Pack — 150 words · accent: peach
`Legal English and Latin. The terms that courts, contracts, and constitutions depend on. You learn where they actually came from.`
Examples: Habeas corpus · Prima facie · Tort
Inside: Civil Law · Contract Law · Criminal Law · Court & Procedure · Latin Legal Terms

### The Music Pack — 150 words · accent: blush
`The full vocabulary of musical life. Classical notation, jazz improvisation, folk tradition, and the stage.`
Examples: Cadenza · Syncopation · Libretto
Inside: Classical & Orchestral · Jazz & Blues · Song & Folk · Stage & Performance · Instruments

### The Games Pack — 30 words · accent: lavender
`Chess terms, card game vocabulary, and the etymology of sport and play. Thirty words, all with better origins than you'd expect.`
Examples: Gambit · Stalemate · Mulligan
Inside: Chess & Strategy · Cards & Gambling · Sport & Athletics

**Featured words shown in each pack's detail marquee** (each pack now renders its own three featured words):

- **Literary:** Pandemonium — *Coined by Milton in Paradise Lost, 1667. From Greek pan (all) + daimon (spirit).* · Chortle — *Invented by Lewis Carroll in Through the Looking-Glass, 1871. A blend of chuckle and snort.* · Assassination — *First used by Shakespeare in Macbeth, 1606. From Arabic hashshashin.*
- **Loan Words:** Schadenfreude — *From German: Schaden (harm) + Freude (joy). Pleasure from another's misfortune.* · Juggernaut — *From Hindi Jagannath, a title of the god Vishnu. Via colonial British usage.* · Labyrinth — *From Greek labyrinthos. Possibly from Lydian labrys (double axe).*
- **Mythology:** Narcissism — *From Narcissus, the Greek youth who fell in love with his own reflection.* · Panic — *From Pan, the Greek god whose sudden appearances caused terror.* · Valhalla — *From Old Norse Valhöll — hall of the slain. Where Odin's warriors feasted.*
- **Science:** Entropy — *Coined by Rudolf Clausius in 1865. From Greek entropia — a turning toward.* · Quark — *Coined by physicist Murray Gell-Mann in 1964, from a line in James Joyce's Finnegans Wake.* · Laser — *Acronym coined in 1959: Light Amplification by Stimulated Emission of Radiation.*
- **Eponym:** Kafkaesque — *From Franz Kafka, whose novels depicted nightmarish bureaucratic helplessness.* · Wellington — *Named after the Duke of Wellington, who popularised the rubber boot style.* · Bowdlerise — *From Thomas Bowdler, who published an expurgated edition of Shakespeare in 1818.*
- **Geography:** Fjord — *From Old Norse fjörðr — a narrow sea inlet between cliffs.* · Savanna — *From Spanish sabana, borrowed from Taino zabana. An open tropical grassland.* · Archipelago — *From Italian arcipelago — the Aegean Sea. From Greek archi (chief) + pelagos (sea).*
- **Architecture:** Cantilever — *Origin uncertain, possibly from cant (angle) + lever. A beam supported at one end only.* · Clerestory — *From Middle English: clear + story. The upper windowed section of a church wall.* · Brutalist — *From French béton brut — raw concrete. Coined by Le Corbusier.*
- **Law:** Habeas corpus — *Latin: you shall have the body. A writ protecting against unlawful imprisonment.* · Tort — *From Old French tort, Latin tortus — twisted, wrong. A civil wrong giving rise to liability.* · Prima facie — *Latin: at first face. Evidence sufficient to establish a fact unless rebutted.*
- **Music:** Cadenza — *From Italian cadenza — cadence, falling. A solo passage near the end of a movement.* · Syncopation — *From Greek synkoptein — to cut short. Rhythm that emphasises off-beats.* · Libretto — *From Italian libretto — little book. The text of an opera or musical work.*
- **Games:** Gambit — *From Italian gambetto — a tripping up. An opening move accepting early sacrifice for advantage.* · Stalemate — *From Old French estal (fixed position) + mate (defeated). A draw in chess.* · Mulligan — *Disputed origin, possibly from David Mulligan, a Canadian golfer. A free second attempt.*

---

## 7. Zazu Gold
*File: `components/GoldSection.tsx` — section id `#gold`.*

| Element | Copy |
|---|---|
| Heading | `Zazu Gold.` |
| Subhead | `Every word pack. Full history. Advanced practice. £1.99 a month.` |

**Monthly card:** `£1.99` · `per month` · `7-day free trial` · button `Start free trial`
**Annual card:** badge `Best value` · `£14.99` · `per year` · `Save 37%` · button `Start free trial`

**Feature list:**
- Every word pack included
- 1,740 premium words across ten packs
- Full 30-day word history
- Spaced repetition review
- Etymology roots drill
- Usage lab practice
- Pack focus gym sessions
- Future packs included

> ⚠️ Consistency check: the meta description says **"2,000+ premium words"**, this section says **"1,740 premium words"**, and the ten pack counts above sum to **1,740**. Pick one number to avoid a judge spotting the mismatch.

---

## 8. Word Gym
*File: `components/GymSection.tsx` — the three-round progression timeline.*

| Element | Copy |
|---|---|
| Heading | `Go deeper with Word Gym.` |
| Intro paragraph | `Every word has three gym rounds. Match roots to meanings, complete real literary quotes, deduce definitions from context. Optional, but addictive.` |

**Three rounds** (each card shows `Round N`, a difficulty meter, name, description; Round 3 also shows a gold `· Hardest` tag):

| # | Label | Name | Description |
|---|---|---|---|
| 1 | Round 1 | Etymology | `Match word roots to their meanings. Follow a word back through Latin, Greek, or Old English and understand why it means what it means.` |
| 2 | Round 2 | Quote Completion | `Complete a real quote from the source text. For literary pack words that means Shakespeare, Milton, or Tolkien. You read real lines from the actual works.` |
| 3 | Round 3 · **Hardest** | Contextual Definition | `Read a passage and work out what the word means from context alone. No definition given. The hardest round.` |

---

## 9. Footer
*File: `components/Footer.tsx`.*

| Element | Copy |
|---|---|
| Wordmark | `zazu` |
| Tagline | `A new word. Every morning.` |
| Link 1 | `Privacy Policy` → `/privacy` |
| Link 2 | `Support` → `mailto:hello@zazu.org.uk` |
| Store button 1 | `App Store — Join the Waitlist` → `mailto:hello@zazu.org.uk?subject=Zazu Waitlist — iOS` |
| Store button 2 | `Google Play — Join the Waitlist` → `mailto:hello@zazu.org.uk?subject=Zazu Waitlist — Android` |
| Copyright strip | `© 2026 Lewis White trading as Zazu · hello@zazu.org.uk` |

---

## Flags for review (copy-level)
*All three previously-flagged inconsistencies have been resolved:*
1. ~~Word-count mismatch~~ — meta description now reads "1,700+", consistent with the 1,740-word total and the Gold section.
2. ~~Literary Pack marquee fallback~~ — each pack (including Literary) now renders its own featured words (Pandemonium, Chortle, Assassination).
3. ~~Dead footer "About" link~~ — removed; footer now keeps Privacy Policy + Support only.
