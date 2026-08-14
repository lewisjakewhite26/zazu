# Zazu word library

395 words, generated from `zazu-words.json` (the canonical seed source for the `words` / `word_roots` / `word_morning_tasks` tables — see `scripts/seed-words.mjs`).

## Free vs. Gold — current reality

All 395 words below are currently `tier: free`. The schema supports a `premium` word tier (see `supabase/migrations/001_create_words_schema.sql`), but nothing in the live content is marked premium — there is no "Gold word pack" in the data today.

Zazu Gold's actual gating (per `PRODUCT.md`) works differently: every word is available to every user through the daily alarm ritual. Gold instead unlocks:
- **Full calendar history** — free users can only revisit today + yesterday; everything older is locked behind Gold.
- **Word Gym** — the matching-pairs practice mode, Gold-only.

So the free/gold split lives at the *feature* level, not the *word content* level. If you want an actual curated Gold word pack (a subset of these 395 marked `premium` and gated by the existing RLS policies), that would be new scoping — happy to build it, just say which words or how many.

Separately, **Thematic Word Packs** (Science, Food, Geography, Games, Loan Words, etc.) are planned as a distinct content track inside Word Gym — 30-day campaigns unlocked by coins or an all-access pass, not part of this 395-word daily-alarm library. Spec: `ROADMAP.md` "Coin Economy & Thematic Word Packs." Draft content for two packs already exists in `THEMATIC PACKS/` (Games, Loan Words), not yet imported to Supabase.

## Word list

| # | Word | Pronunciation | Part of speech | Definition | Origin |
|---|------|----------------|-----------------|------------|--------|
| 1 | Mellifluous | meh-LIF-loo-us | adjective | Sweet or musical; pleasant to hear. | From Latin mel (honey) + fluere (to flow), literally flowing with honey. |
| 2 | Ephemeral | ih-FEM-er-ul | adjective | Lasting for a very short time; transitory. | From Greek ephemeros, lasting only a day. From epi (on) + hemera (day). |
| 3 | Lucid | LOO-sid | adjective | Expressed clearly and easy to understand; mentally alert and coherent. | From Latin lucidus, bright, shining, clear. From lux, light. |
| 4 | Sycophant | SIK-oh-fant | noun | A person who acts obsequiously towards someone important in order to gain advantage. | From Greek sykophantes, informer, slanderer. From sykon (fig) + phainein (to show). |
| 5 | Loquacious | loh-KWAY-shus | adjective | Tending to talk a great deal; garrulous. | From Latin loquax, talkative. From loqui, to speak. |
| 6 | Penumbra | peh-NUM-bra | noun | The partially shaded outer region of a shadow; the area between full light and full shadow. | From Latin paene (almost) + umbra (shadow), literally almost a shadow. |
| 7 | Laconic | luh-KON-ik | adjective | Using very few words; brief and concise in speech or expression. | From Greek Lakonikos, of Laconia (Sparta). The Spartans were famous for their brief, blunt speech. |
| 8 | Subterfuge | SUB-ter-fyooj | noun | Deceit used in order to achieve one's goal; a trick or stratagem. | From Latin subter (beneath, secretly) + fugere (to flee), fleeing secretly underneath. |
| 9 | Ebullient | ih-BUL-yent | adjective | Cheerful and full of energy; enthusiastic and exuberant. | From Latin ebullire, to bubble up or boil over. From e (out) + bullire (to boil). |
| 10 | Tenacious | teh-NAY-shus | adjective | Holding firmly to something; not easily pulled apart; persistent and determined. | From Latin tenax, holding fast. From tenere, to hold. |
| 11 | Parsimonious | par-sih-MOH-nee-us | adjective | Very unwilling to spend money or use resources; excessively frugal. | From Latin parsimonia, frugality. From parcere, to spare or save. |
| 12 | Equanimity | ee-kwuh-NIM-ih-tee | noun | Mental calmness and composure, especially in difficult situations. | From Latin aequus (equal, calm) + animus (mind, spirit), an even, calm mind. |
| 13 | Truculent | TRUK-yoo-lent | adjective | Eager or quick to argue or fight; aggressively defiant. | From Latin truculentus, fierce, savage. From trux, fierce, wild. |
| 14 | Sanguine | SANG-gwin | adjective | Optimistic or positive, especially in a difficult situation. | From Latin sanguis, blood. Medieval medicine believed a blood-dominant temperament produced a cheerful outlook. |
| 15 | Perfidious | per-FID-ee-us | adjective | Deceitful and untrustworthy; guilty of betrayal. | From Latin perfidia, treachery. From per (away from) + fides (faith). |
| 16 | Obdurate | OB-dyoo-ret | adjective | Stubbornly refusing to change one's opinion or course of action; hard-hearted. | From Latin obdurare, to harden against. From ob (against) + durare (to harden). |
| 17 | Pernicious | per-NISH-us | adjective | Having a harmful effect, especially in a gradual or subtle way. | From Latin perniciosus, destructive. From pernicies, destruction. From per (through) + nex (death). |
| 18 | Propitious | proh-PISH-us | adjective | Giving or indicating a good chance of success; favourable. | From Latin propitius, favourable. From pro (before) + petere (to seek). |
| 19 | Recalcitrant | rih-KAL-sih-trant | adjective | Having an obstinately uncooperative attitude towards authority or discipline. | From Latin recalcitrare, to kick back. From re (back) + calx (heel). |
| 20 | Autodidact | aw-toh-DY-dakt | noun | A self-taught person; one who has learned a subject without formal instruction. | From Greek autos (self) + didaktos (taught), one who has taught themselves. |
| 21 | Magnanimous | mag-NAN-ih-mus | adjective | Generous or forgiving, especially towards a rival or less powerful person. | From Latin magnus (great) + animus (soul), having a great soul. |
| 22 | Quixotic | kwik-SOT-ik | adjective | Exceedingly idealistic; unrealistic and impractical in the pursuit of noble but unachievable goals. | From Don Quixote, the idealistic knight-errant of Cervantes' 1605 novel who tilted at windmills. |
| 23 | Ennui | on-WEE | noun | A feeling of listlessness and dissatisfaction arising from a lack of occupation or excitement. | From French ennui, boredom. From Latin in odio esse, to be hateful. |
| 24 | Denouement | day-NOO-mahn | noun | The final part of a story in which the strands of the plot are drawn together and matters are resolved. | From French dénouer, to untie. From de (un-) + nouer (to knot), the unknotting of the plot. |
| 25 | Hegemony | heh-JEM-oh-nee | noun | Leadership or dominance, especially of one country or social group over others. | From Greek hegemonia, leadership. From hegemon, leader, from hegeisthai, to lead. |
| 26 | Iridescent | ir-ih-DES-ent | adjective | Showing luminous colours that seem to change when seen from different angles. | From Latin iris, rainbow (from Greek). The rainbow goddess Iris lent her name to this shimmering quality. |
| 27 | Solipsism | SOL-ip-siz-um | noun | The philosophical theory that only the self exists or can be known; extreme self-centredness. | From Latin solus (alone) + ipse (self), the view that only oneself truly exists. |
| 28 | Chiaroscuro | kee-ar-oh-SKYOOR-oh | noun | The treatment of light and shadow in a painting or drawing; stark contrast between light and dark. | From Italian chiaro (clear, light) + oscuro (dark, obscure). Used in Renaissance art. |
| 29 | Palimpsest | PAL-imp-sest | noun | A manuscript page that has been scraped and reused; something altered but still bearing traces of its earlier form. | From Greek palin (again) + psestos (scraped), scraped again for reuse. |
| 30 | Perspicacious | per-spih-KAY-shus | adjective | Having a ready insight into things; shrewd and having a keen understanding. | From Latin perspicax, sharp-sighted. From per (through) + specere (to look). |
| 31 | Insouciant | in-SOO-see-unt | adjective | Showing a casual lack of concern; carefree and indifferent. | From French insouciant, not caring. From in (not) + soucier (to worry). |
| 32 | Susurrus | soo-SUR-us | noun | A soft murmuring or whispering sound. | From Latin susurrus, a murmur, whisper, or hum. An onomatopoeic word. |
| 33 | Noctilucent | nok-tih-LOO-sent | adjective | Phosphorescent or luminous at night; used to describe rare high-altitude clouds visible after sunset. | From Latin nox (night) + lucere (to shine), shining in the night. |
| 34 | Sempiternal | sem-pih-TER-nul | adjective | Eternal and unchanging; everlasting. | From Latin semper (always) + aeternus (eternal), always eternal. |
| 35 | Recondite | REK-un-dyt | adjective | Not known by many people; obscure and dealing with little-known subjects. | From Latin reconditus, hidden away. From re (again) + condere (to store or hide). |
| 36 | Pellucid | peh-LOO-sid | adjective | Translucently clear; easily understood; expressed in a very clear and elegant style. | From Latin pellucere, to shine through. From per (through) + lucere (to shine). |
| 37 | Impecunious | im-peh-KYOO-nee-us | adjective | Having little or no money; poor. | From Latin im (not) + pecunia (money). Pecunia itself comes from pecus, cattle, once used as currency. |
| 38 | Sangfroid | sahn-FRWAH | noun | Composure or coolness shown in dangerous or difficult situations. | From French sang (blood) + froid (cold), cold blood; the ability to remain cool under pressure. |
| 39 | Panacea | pan-uh-SEE-uh | noun | A solution or remedy for all difficulties or diseases; a universal cure. | From Greek panakeia, all-healing. From pan (all) + akos (remedy). Panacea was a Greek goddess of healing. |
| 40 | Sartorial | sar-TOR-ee-ul | adjective | Relating to tailoring, clothes, or style of dress. | From Latin sartor, a tailor. From sarcire, to mend or patch. |
| 41 | Defenestration | dee-fen-eh-STRAY-shun | noun | The action of throwing someone out of a window. | From Latin de (down from) + fenestra (window). Coined after the Defenestration of Prague, 1618. |
| 42 | Scintilla | sin-TIL-uh | noun | A tiny trace or spark of a specified quality or feeling. | From Latin scintilla, a spark. Related to scintillate, to sparkle. |
| 43 | Enervate | EN-er-vayt | verb | To make someone feel drained of energy or vitality; to weaken. | From Latin enervare, to remove the sinew. From e (out) + nervus (sinew, nerve). |
| 44 | Crepuscular | kreh-PUS-kyoo-lar | adjective | Relating to or resembling twilight; active in the twilight hours of dawn or dusk. | From Latin crepusculum, twilight. From creper, dark or uncertain. |
| 45 | Diaphanous | dy-AF-uh-nus | adjective | Light, delicate, and translucent; so thin as to be almost transparent. | From Greek diaphanes, transparent. From dia (through) + phainein (to show). |
| 46 | Plangent | PLAN-jent | adjective | Loud and resonant with a mournful tone; having an expressive and plaintive quality. | From Latin plangere, to beat or strike the breast in grief; to lament loudly. |
| 47 | Tenebrous | TEN-eh-brus | adjective | Dark, shadowy, and obscure. | From Latin tenebrae, darkness, shadows. The Tenebrae was a Holy Week service held in darkness. |
| 48 | Ululation | yoo-lyoo-LAY-shun | noun | A long, high-pitched wavering cry used to express strong emotion. | From Latin ululare, to howl or wail. An onomatopoeic word. |
| 49 | Lacuna | luh-KYOO-nuh | noun | A gap or missing portion, especially in a manuscript, text, or argument. | From Latin lacuna, a pit, hole, or pool. From lacus, a lake or hollow. |
| 50 | Lambent | LAM-bent | adjective | Softly bright or radiant; softly brilliant or playful. | From Latin lambere, to lick. Lambent light licks softly across a surface. |
| 51 | Coruscating | KOR-us-kay-ting | adjective | Flashing and sparkling; brilliantly striking in display or effect. | From Latin coruscare, to flash or vibrate. Related to lightning-like movement. |
| 52 | Shibboleth | SHIB-uh-leth | noun | A custom, word, or phrase that distinguishes a particular group; an old idea or belief regarded as outdated. | From Hebrew shibboleth, an ear of grain. Used in the Bible to identify enemies who could not pronounce the sh sound. |
| 53 | Numinous | NYOO-min-us | adjective | Having a strong religious or spiritual quality; indicating or suggesting the presence of a divinity. | From Latin numen, divine power or will. The force that gods were thought to exert. |
| 54 | Ratiocination | rat-ee-os-ih-NAY-shun | noun | The process of logical and methodical reasoning. | From Latin ratio, reason, reckoning. From reri, to reckon or think. |
| 55 | Vituperative | vy-TOO-per-uh-tiv | adjective | Bitter and abusive in speech or criticism. | From Latin vituperare, to blame or censure. From vitium (fault) + parare (to prepare). |
| 56 | Internecine | in-ter-NEE-syn | adjective | Destructive to both sides in a conflict; relating to conflict within a group. | From Latin internecinus, mutually destructive. From inter (between) + necare (to kill). |
| 57 | Meretricious | mer-ih-TRISH-us | adjective | Apparently attractive but having in reality no value or integrity; showily attractive. | From Latin meretrix, a prostitute. From merere, to earn. Evolved to mean flashily deceptive. |
| 58 | Phantasmagoric | fan-taz-muh-GOR-ik | adjective | Relating to a sequence of real or imaginary images like those seen in a dream; bizarre and dreamlike. | From French phantasmagorie, a magic lantern show. From Greek phantasma (apparition) + agora (assembly). |
| 59 | Voluble | VOL-yoo-bul | adjective | Speaking or spoken incessantly and fluently; prone to talking at length. | From Latin volvere, to roll. Words rolling out rapidly and continuously. |
| 60 | Fecund | FEE-kund | adjective | Producing an abundance of offspring or new growth; highly fertile or productive. | From Latin fecundus, fruitful, fertile. Related to fetus, offspring. |
| 61 | Inimical | ih-NIM-ih-kul | adjective | Tending to obstruct or harm; hostile and unfriendly. | From Latin inimicus, enemy. From in (not) + amicus (friend). |
| 62 | Predilection | pred-ih-LEK-shun | noun | A preference or special liking for something; a bias in favour of something. | From French predilection. From Latin prae (before) + diligere (to love or choose). |
| 63 | Peripatetic | per-ih-puh-TET-ik | adjective | Travelling from place to place; itinerant. Also relating to Aristotle school of philosophy. | From Greek peripatetikos, of walking about. From peri (around) + patein (to walk). Aristotle taught while walking. |
| 64 | Ignominious | ig-noh-MIN-ee-us | adjective | Deserving or causing public disgrace or shame. | From Latin ignominia, disgrace. From in (not) + nomen (name), a state of having no good name. |
| 65 | Obstreperous | ob-STREP-er-us | adjective | Noisy and difficult to control; loudly resistant. | From Latin obstreperus, clamorous. From ob (against) + strepere (to make noise). |
| 66 | Vociferous | voh-SIF-er-us | adjective | Expressing or characterised by vehement opinions; loud and forceful. | From Latin vox (voice) + ferre (to carry), carrying the voice loudly. |
| 67 | Compunction | kum-PUNK-shun | noun | A feeling of guilt or moral scruple that prevents or follows the doing of something bad. | From Latin compungere, to prick or sting sharply. From com (intensive) + pungere (to prick). |
| 68 | Portentous | por-TEN-tus | adjective | Of momentous or ominous significance; done in a pompously solemn manner. | From Latin portentum, an omen or sign. From portendere, to foretell. |
| 69 | Palaver | puh-LAV-er | noun | Prolonged and idle discussion; unnecessary fuss. | From Portuguese palavra, word, speech. From Latin parabola, parable, speech. |
| 70 | Risible | RIZ-ih-bul | adjective | Such as to provoke laughter; laughable or ludicrous. | From Latin risibilis, able to laugh. From ridere, to laugh. |
| 71 | Lachrymose | LAK-rih-mohs | adjective | Tearful or given to weeping; inducing tears. | From Latin lacrima, a tear. The lacrimal glands are named from the same root. |
| 72 | Ossify | OS-ih-fy | verb | To turn into bone; to become rigid and fixed in one's ways. | From Latin os (bone) + facere (to make), to make into bone. |
| 73 | Jejune | jih-JOON | adjective | Naive, simplistic, and superficial; lacking in nutritive value or interest. | From Latin jejunus, fasting, empty, meagre. Originally meant hungry or lacking nourishment. |
| 74 | Nugatory | NYOO-guh-tor-ee | adjective | Of no value or importance; trifling; having no legal force. | From Latin nugae, trifles, jokes. From nugari, to trifle. |
| 75 | Limpid | LIM-pid | adjective | Completely clear and transparent; free from turbidity; lucid and easily understood. | From Latin limpidus, clear, pure. Related to lympha, clear water. |
| 76 | Pugnacious | pug-NAY-shus | adjective | Eager or quick to argue, quarrel, or fight; combative. | From Latin pugnus, fist. From pugna, a fight. |
| 77 | Tendentious | ten-DEN-shus | adjective | Promoting a particular cause or point of view; expressing a strong opinion in a one-sided way. | From Latin tendere, to stretch or aim at. |
| 78 | Obeisance | oh-BAY-suns | noun | A gesture expressing deferential respect, such as a bow or curtsy; deferential homage. | From Old French obeissance, obedience. From Latin oboedire. |
| 79 | Perspicuous | per-SPIK-yoo-us | adjective | Clearly expressed and easily understood; lucid. | From Latin perspicuus, transparent. From perspicere, to see through clearly. |
| 80 | Fugacious | fyoo-GAY-shus | adjective | Tending to disappear; fleeting and transient. | From Latin fugax, fleeing. From fugere, to flee. |
| 81 | Vitreous | VIT-ree-us | adjective | Like glass in appearance or physical properties; glassy. | From Latin vitreum, glass. From vitrum, glass or glassy substance. |
| 82 | Penultimate | peh-NUL-tih-mit | adjective | Last but one in a series; the second to last. | From Latin paene (almost) + ultimus (last), almost the last. |
| 83 | Loquacity | loh-KWAS-ih-tee | noun | The quality of talking a great deal; talkativeness. | From Latin loquax, talkative. From loqui, to speak. |
| 84 | Melancholia | mel-un-KOH-lee-uh | noun | A deep, pensive, and long-lasting sadness; a mood of gloomy pensiveness. | From Greek melas (black) + khole (bile). Medieval medicine believed black bile caused low spirits. |
| 85 | Perfunctory | per-FUNK-tor-ee | adjective | Carried out with minimal effort or care; done as a routine duty. | From Latin perfungi, to get through with. From per (through) + fungi (to perform). |
| 86 | Alacrity | uh-LAK-rih-tee | noun | Brisk and cheerful readiness to do something. | From Latin alacer, lively, eager. Related to the idea of swift and willing action. |
| 87 | Discombobulate | dis-kom-BOB-yoo-layt | verb | To disconcert or confuse someone. | An American coinage from the 19th century, likely a playful elaboration of discompose or discomfit. |
| 88 | Ineffable | in-EF-uh-bul | adjective | Too great or extreme to be expressed or described in words. | From Latin ineffabilis, unspeakable. From in (not) + effari (to speak out). |
| 89 | Sanguinity | sang-GWIN-ih-tee | noun | The quality of being optimistic or positive, especially in a difficult situation. | From Latin sanguis, blood. Medieval medicine linked a blood-rich constitution with a cheerful temperament. |
| 90 | Vertiginous | ver-TIJ-in-us | adjective | Causing vertigo, especially by being extremely high or steep; whirling. | From Latin vertigo, dizziness. From vertere, to turn. |
| 91 | Lugubrious | luh-GOO-bree-us | adjective | Looking or sounding sad and dismal. | From Latin lugubris, mournful. From lugere, to mourn. |
| 92 | Desultory | DES-ul-tor-ee | adjective | Lacking a plan, purpose, or enthusiasm; going from one thing to another without order. | From Latin desultorius, of a circus rider who leaps between horses. From desilire, to leap down. |
| 93 | Onerous | ON-er-us | adjective | Involving a great deal of effort, trouble, or difficulty; burdensome. | From Latin onerosus, burdensome. From onus, a load or burden. |
| 94 | Recusant | REK-yoo-zunt | noun | A person who refuses to submit to an authority or comply with a regulation; historically, an English Catholic who refused to attend Church of England services. | From Latin recusare, to refuse. From re (back) + causa (cause, reason). |
| 95 | Prolix | PROH-liks | adjective | Using or containing too many words; tediously lengthy. | From Latin prolixus, extended, poured forth. From pro (forward) + liquere (to flow). |
| 96 | Insipid | in-SIP-id | adjective | Lacking flavour; weak or tasteless. Also: lacking vigour or interest; dull. | From Latin insipidus, tasteless. From in (not) + sapidus (savoury, tasty). |
| 97 | Convivial | kun-VIV-ee-ul | adjective | Relating to or fond of feasting, drinking, and good company; friendly and lively. | From Latin convivium, a feast or banquet. From con (together) + vivere (to live). |
| 98 | Execrable | EK-sih-kruh-bul | adjective | Extremely bad or unpleasant; utterly detestable. | From Latin execrabilis, accursed. From exsecrari, to curse. From ex (out) + sacer (sacred). |
| 99 | Diaspora | die-ASS-por-uh | noun | The scattering of a people from their original homeland; the community formed by those who live abroad. | From Greek diaspora, scattering. From dia- (across) + speirein (to sow or scatter). |
| 100 | Petrichor | PET-ri-kor | noun | The pleasant earthy smell that rises from dry ground when rain falls after a dry spell. | Coined in 1964 from Greek petros (stone) + ichor (the mythical fluid in the veins of the gods). |
| 101 | Anfractuous | an-FRAK-choo-us | adjective | Sinuous and winding in character; full of twists and turns. | From Latin anfractus,a winding, a turning. From amb (around) + fractus (broken, bent). |
| 102 | Apocryphal | uh-POK-rih-ful | adjective | Of doubtful authenticity; widely circulated but probably not true. | From Greek apokryphos,hidden away. From apo (away) + kryptein (to hide). |
| 103 | Atavistic | at-uh-VIS-tik | adjective | Relating to or characterised by reversion to something ancient or ancestral. | From Latin atavus,a great-great-great-grandfather; a remote ancestor. From ata (father) + avus (grandfather). |
| 104 | Bathetic | buh-THET-ik | adjective | Producing an effect of anticlimax through an abrupt and disappointing descent from the elevated to the trivial. | From Greek bathos,depth. First used by Alexander Pope in 1727 to describe a ludicrous descent in writing. |
| 105 | Casuistry | KAZ-yoo-is-tree | noun | The use of clever but unsound reasoning to resolve moral problems; specious argumentation. | From Latin casus,a case or event. From cadere,to fall. |
| 106 | Contumacious | kon-tyoo-MAY-shus | adjective | Stubbornly or wilfully disobedient to authority. | From Latin contumax,insolent, stubborn. From con (intensive) + tumere (to swell with pride). |
| 107 | Desuetude | DES-wih-tyood | noun | A state of no longer being practised or used; disuse. | From Latin desuetudo,disuse. From de (away from) + suescere (to become accustomed). |
| 108 | Evanescent | ev-uh-NES-ent | adjective | Soon passing out of sight, memory, or existence; quickly fading or disappearing. | From Latin evanescere,to vanish. From e (out) + vanescere (to become empty). |
| 109 | Fatuous | FACH-oo-us | adjective | Silly and pointless; complacently or inanely foolish. | From Latin fatuus,foolish, insipid. Related to fari,to speak. |
| 110 | Garrulous | GAR-uh-lus | adjective | Excessively talkative, especially on trivial matters. | From Latin garrulus,chattering, talkative. From garrire,to chatter or prattle. |
| 111 | Heterodox | HET-er-oh-doks | adjective | Not conforming to accepted or orthodox standards or beliefs. | From Greek heteros (other, different) + doxa (opinion, belief). |
| 112 | Imprimatur | im-prih-MAH-ter | noun | Official approval or licence to print or publish; more broadly, any formal authorisation. | From Latin imprimatur,let it be printed. From imprimere,to press upon or imprint. |
| 113 | Inveterate | in-VET-er-ut | adjective | Having a particular habit, activity, or interest that is deeply established and unlikely to change. | From Latin inveteratus,of long standing. From in (intensive) + vetus (old). |
| 114 | Lissom | LIS-um | adjective | Thin, supple, and graceful in movement. | A contraction of lithesome, from Old English lithe (flexible, gentle) + -some (having the quality of). |
| 115 | Luminary | LOO-mih-ner-ee | noun | A person who inspires or influences others, especially in a particular sphere; also a natural light-giving body. | From Latin luminare,a light, a lamp. From lumen,light. |
| 116 | Mnemonic | nih-MON-ik | adjective | Aiding or designed to aid the memory; a device such as a pattern or rhyme used to assist recall. | From Greek mnemonikos,of memory. From mnemon (mindful) + mnasthai (to remember). Mnemosyne was the Greek goddess of memory. |
| 117 | Nacreous | NAY-kree-us | adjective | Having the lustre of mother-of-pearl; iridescent and pearlescent. | From French nacre,mother-of-pearl. Probably from Arabic naqqara,a drum, referring to the shell's shape. |
| 118 | Obstinate | OB-stih-nut | adjective | Stubbornly refusing to change one's opinion or chosen course of action, despite attempts to persuade. | From Latin obstinatus,resolved, persistent. From ob (against) + stare (to stand). |
| 119 | Pecuniary | pih-KYOO-nee-er-ee | adjective | Relating to or consisting of money. | From Latin pecuniarius,of money. From pecunia,money, wealth. From pecus,cattle, once used as currency. |
| 120 | Querulous | KWER-oo-lus | adjective | Complaining in a petulant or whining manner. | From Latin querulus,full of complaints. From queri,to complain. |
| 121 | Recidivism | rih-SID-ih-viz-um | noun | The tendency of a convicted criminal to reoffend; the habit of relapsing into criminal behaviour. | From Latin recidivus,recurring. From re (back, again) + cadere (to fall). |
| 122 | Soporific | sop-uh-RIF-ik | adjective | Tending to induce sleep; a drug or other substance that causes sleep. | From Latin sopor (deep sleep) + facere (to make). Related to Hypnos, the Greek god of sleep. |
| 123 | Temerity | teh-MER-ih-tee | noun | Excessive confidence or boldness; audacity. | From Latin temeritas,rashness. From temere,blindly, rashly, by chance. |
| 124 | Unctuous | UNK-choo-us | adjective | Excessively flattering or ingratiating; having a smooth greasy feel or appearance. | From Latin unctuosus,greasy. From ungere,to anoint with oil. |
| 125 | Abnegation | ab-neh-GAY-shun | noun | The solemn act of renouncing or rejecting something desired or valuable. | From Latin abnegare, from ab- (away, off) + negare (to deny). |
| 126 | Abrasive | uh-BRAY-siv | adjective | Showing little concern for the feelings of others, harsh or rough in manner. | From Latin abrasus, from abradere (to scrape away). |
| 127 | Abrogate | AB-ruh-gayt | verb | To repeal or do away with a law, right, or formal agreement. | From Latin abrogatus, from ab- (away) + rogare (to propose a law). |
| 128 | Abscission | ab-SIZ-shun | noun | The natural shedding of old leaves, flowers, or ripe fruit from a plant. | From Latin abscissio, from ab- (away) + scindere (to cut). |
| 129 | Acclivity | uh-KLIV-ih-tee | noun | An upward slope or incline of a hill or ground. | From Latin acclivitas, from ad- (toward) + clivus (a slope). |
| 130 | Accretion | uh-KREE-shun | noun | Growth or increase by the gradual accumulation of additional layers or matter. | From Latin accretio, from accrescere (to grow to). |
| 131 | Acerbic | uh-SUR-bik | adjective | Sharp and forthright, especially in speaking or writing style. | From Latin acerbus, from acer (sour, sharp, bitter). |
| 132 | Acme | AK-mee | noun | The point at which something is at its best, highest, or most successful. | From Greek akme (highest point, peak, sharp edge). |
| 133 | Acumen | AK-yoo-men | noun | The ability to make good judgments and take quick decisions. | From Latin acumen, from acuere (to sharpen). |
| 134 | Adduce | uh-DYOOSS | verb | To cite as evidence or list as a reason in an argument. | From Latin adducere, from ad- (toward) + ducere (to lead). |
| 135 | Adumbrate | AD-um-brayt | verb | To represent or outline vaguely, to foreshadow or sketch out. | From Latin adumbratus, from ad- (towards) + umbrare (to cast a shadow). |
| 136 | Adventitious | ad-ven-TISH-us | adjective | Happening or carried on according to chance rather than design. | From Latin adventicius, from advenire (to arrive). |
| 137 | Aesthetic | ees-THET-ik | adjective | Concerned with beauty or the appreciation of beauty. | From Greek aisthetikos, from aisthesis (perception, sensation). |
| 138 | Ameliorate | uh-MEE-lee-uh-rayt | verb | To make something bad or unsatisfactory better. | From French améliorer, based on Latin melior (better). |
| 139 | Anachronism | uh-NAK-ruh-niz-um | noun | A thing belonging or appropriate to a period other than that in which it exists. | From Greek anakhronismos, from ana- (backwards) + khronos (time). |
| 140 | Anathema | uh-NATH-uh-muh | noun | Something or someone that one vehemently dislikes or detests. | From Greek anathema (a thing accursed, a thing devoted to evil). |
| 141 | Animus | AN-ih-mus | noun | A powerful feeling of ill will, animosity, or hostile intent. | From Latin animus (spirit, mind, courage, anger). |
| 142 | Apotheosis | uh-poth-ee-OH-sis | noun | The highest point in the development of something, a culmination or deification. | From Greek apotheosis, from apo- (change) + theos (god). |
| 143 | Asperity | as-PER-ih-tee | noun | Harshness of tone or manner, or a rough edge on a surface. | From Latin asperitas, from asper (rough, harsh). |
| 144 | Assiduous | uh-SID-yoo-us | adjective | Showing great care, attention, and persistent effort. | From Latin assiduus, from adsidere (to sit down to, attend to). |
| 145 | Banal | buh-NAHL | adjective | So lacking in originality as to be obvious and boring. | From French banal, from ban (a compulsory summons to military service). |
| 146 | Beguile | bih-GYL | verb | To charm or enchant someone, sometimes in a deceptive way. | From Middle English be- (thoroughly) + Old French guile (deceit). |
| 147 | Bellicose | BEL-ih-kohss | adjective | Demonstrating aggression and a willingness to fight. | From Latin bellicosus, from bellum (war). |
| 148 | Beneficent | beh-NEF-ih-sent | adjective | Resulting in good, or performing acts of kindness or charity. | From Latin beneficentia, from bene (well) + facere (to do). |
| 149 | Bifurcate | BY-fur-kayt | verb | To divide or branch into two separate parts. | From Latin bifurcatus, from bi- (two) + furca (a fork). |
| 150 | Blandishment | BLAN-dish-ment | noun | A flattering or pleasing statement or action used to persuade someone. | From Old French blandir, based on Latin blandus (smooth, soft, flattering). |
| 151 | Cacophony | kuh-KOF-uh-nee | noun | A harsh, discordant mixture of sounds. | From Greek kakophonia, from kakos (bad) + phone (voice, sound). |
| 152 | Cadence | KAY-dunss | noun | A modulation or inflection of the voice, or the rhythmic flow of a sequence of sounds. | From Latin cadentia, from cadere (to fall). |
| 153 | Calumny | KAL-um-nee | noun | The making of false and defamatory statements about someone in order to damage their reputation. | From Latin calumnia, from calvi (to deceive, trick). |
| 154 | Canard | kuh-NAHRD | noun | An unfounded rumour or story, especially a deliberately misleading one. | From French canard (duck), from the idiom vendre des canards à moitié (to half-sell ducks). |
| 155 | Capricious | kuh-PRISH-us | adjective | Given to sudden and unaccountable changes of mood or behaviour. | From Italian capriccioso, from capriccio (whim, literally a shivering, goat-like skip). |
| 156 | Castigate | KAS-tih-gayt | verb | To reprimand or criticise someone severely. | From Latin castigatus, from castus (pure) + agere (to drive, make). |
| 157 | Catharsis | kuh-THAR-sis | noun | The process of releasing, and thereby providing relief from, strong or repressed emotions. | From Greek katharsis, from kathairein (to cleanse, purify). |
| 158 | Caustic | KAW-stik | adjective | Sarcastic in a scathing and bitter way, or able to burn organic tissue by chemical action. | From Greek kaustikos, from kaiein (to burn). |
| 159 | Celerity | suh-LER-ih-tee | noun | Swiftness of movement, or rapid speed. | From Latin celeritas, from celer (swift, fast). |
| 160 | Censure | SEN-shur | noun | The formal expression of severe disapproval, especially by an official body. | From Latin censura, from censere (to assess, judge, give an opinion). |
| 161 | Chary | CHAIR-ee | adjective | Cautious or suspiciously reluctant to do something. | From Old English cearig (sorrowful, anxious), from cearu (care). |
| 162 | Chimerical | ky-MER-ih-kul | adjective | Created by an unchecked imagination, highly improbable or unrealistic. | From Greek khimaira (a mythical fire-breathing monster made of various animal parts). |
| 163 | Circuitous | ser-KYOO-ih-tus | adjective | Longer and more indirect than the most direct way. | From Latin circuitus, from circum- (around) + ire (to go). |
| 164 | Circumspect | SER-kum-spekt | adjective | Wary and unwilling to take risks, careful. | From Latin circumspectus, from circum- (around) + specere (to look). |
| 165 | Clairvoyant | klair-VOY-unt | noun | A person who claims to have a supernatural ability to perceive events in the future. | From French clair (clear) + voyant (seeing). |
| 166 | Clemency | KLEM-un-see | noun | Mercy or leniency shown by an authority figure towards an offender. | From Latin clementia, from clemens (mild, merciful, gentle). |
| 167 | Coalesce | koh-uh-LESS | verb | To come together to form one mass or whole. | From Latin coalescere, from co- (together) + alescere (to grow up). |
| 168 | Cogent | KOH-jent | adjective | Clear, logical, and convincing in the context of an argument. | From Latin cogere, from co- (together) + agere (to drive). |
| 169 | Cognizant | KOG-nih-zunt | adjective | Having knowledge or awareness of something. | From Old French conoissant, based on Latin cognoscere (to get to know). |
| 170 | Collusion | kuh-LOO-zhun | noun | Secret or illegal cooperation or conspiracy, especially in order to deceive others. | From Latin collusio, from colludere (to play together, conspire). |
| 171 | Commensurate | kuh-MEN-shur-ut | adjective | Corresponding in size, degree, or proportion. | From Latin commensuratus, from com- (together) + mensurare (to measure). |
| 172 | Compendious | kum-PEN-dee-us | adjective | Containing or presenting the essential facts of something in a comprehensive but concise way. | From Latin compendiosus, from compendium (an abridgement, literally a weighing together). |
| 173 | Complacent | kum-PLAY-sunt | adjective | Showing smug or uncritical satisfaction with oneself or one's achievements. | From Latin complacentia, from complacere (to please greatly). |
| 174 | Concomitant | kun-KOM-ih-tunt | adjective | Naturally accompanying or associated with something else. | From Latin concomitari, from com- (together) + comes (companion). |
| 175 | Conflagration | kon-fluh-GRAY-shun | noun | An extensive fire which destroys a great deal of land or property. | From Latin conflagratio, from com- (thoroughly) + flagrare (to blaze). |
| 176 | Dearth | DURTH | noun | A scarcity or lack of something. | From Middle English derthe, from Old English deore (precious, costly, dear). |
| 177 | Debauchery | dih-BAW-chuh-ree | noun | Excessive indulgence in physical pleasures or wild living. | From French débaucher, from dé- (turn away) + Old French bauche (a beam or workshop). |
| 178 | Decorous | DEK-uh-rus | adjective | In keeping with good taste and propriety, polite and restrained. | From Latin decorus, from decor (beauty, elegance, grace). |
| 179 | Decry | dih-KRY | verb | To publicly denounce or express strong disapproval of something. | From French décrier, from dé- (down) + crier (to cry out). |
| 180 | Deference | DEF-uh-runss | noun | Polite submission and respect shown to an elder or authority figure. | From French déférence, from déférer, from Latin deferre (to carry down, submit). |
| 181 | Deleterious | del-ih-TEER-ee-us | adjective | Causing harm or damage. | From Greek deleterios, from deleisthai (to hurt, injure, damage). |
| 182 | Demagogue | DEM-uh-gog | noun | A political leader who seeks support by appealing to popular desires rather than using rational argument. UK spelling. | From Greek demagogogos, from demos (people) + agogos (leader, leading). |
| 183 | Demur | dih-MUR | verb | To raise objections or show reluctance to do something. | From Old French demorer, from Latin demorari (to linger, delay). |
| 184 | Denigrate | DEN-ih-grayt | verb | To criticise unfairly, disparage, or defame someone's reputation. | From Latin denigratis, from de- (completely) + nigrare (to blacken). |
| 185 | Depravity | dih-PRAV-ih-tee | noun | Moral corruption or wickedness. | From alteration of Old French depraver, from Latin depravare (to pervert, distort, corrupt). |
| 186 | Deprecate | DEP-ruh-kayt | verb | To express strong disapproval of something, or to play down the value of. | From Latin deprecatus, from de- (away) + precari (to pray). |
| 187 | Deride | dih-RYD | verb | To express contempt for, or mock someone or something cruelly. | From Latin deridere, from de- (down, thoroughly) + ridere (to laugh). |
| 188 | Descry | dih-SKRY | verb | To catch sight of something distant, obscure, or hard to see. | From Old French decrier (cry down, proclaim), from dé- (thoroughly) + crier (to cry). |
| 189 | Desecrate | DES-ih-krayt | verb | To violate or treat a sacred place or thing with violent disrespect. | From reversal of Latin sacrare (to dedicate as sacred), influenced by de- (reversing action). |
| 190 | Desiccate | DES-ih-kayt | verb | To remove the moisture from something, completely drying it out. | From Latin desiccatus, from de- (thoroughly) + siccare (to dry). |
| 191 | Despotism | DES-puh-tiz-um | noun | The exercise of absolute power, especially in a cruel and oppressive way. | From French despotisme, from Greek despotes (master, lord, absolute ruler). |
| 192 | Diatribe | DY-uh-tryb | noun | A forceful and bitter verbal attack against someone or something. | From Greek diatribe (discourse, pastime, a wasting of time). |
| 193 | Dictum | DIK-tum | noun | A formal pronouncement from an authoritative source, or a short popular saying. | From Latin dictum, from dicere (to say, speak, pronounce). |
| 194 | Didactic | dy-DAK-tik | adjective | Intended to teach, particularly in having moral instruction as an unstated motive. | From Greek didaktikos, from didaskein (to teach). |
| 195 | Diffident | DIF-ih-dunt | adjective | Modest or shy because of a lack of self-confidence. | From Latin diffidentem, from diffidere (to mistrust, lack confidence). |
| 196 | Dilatory | DIL-uh-tur-ee | adjective | Slow to act, or deliberately intended to cause delay. | From Latin dilatorius, from dilator (a procrastinator, delayer). |
| 197 | Din | DIN | noun | A loud, unpleasant, and prolonged noise. | From Old English dyn or dynnan (to resound, echo, rattle). |
| 198 | Disabuse | dis-uh-BYOOZ | verb | To persuade someone that an idea or belief is mistaken. | From French désabuser, from dés- (reversing) + abuser (to misuse, mislead). |
| 199 | Disparate | DIS-puh-rut | adjective | Essentially different in kind, not allowing for a fair comparison. | From Latin disparatus, from dispar (unequal, separate). |
| 200 | Dissemble | dih-SEM-bul | verb | To conceal one's true motives, feelings, or beliefs. | From Old French dissembler, an alteration of Latin dissimulare (to disguise, conceal). |
| 201 | Dissonance | DIS-uh-nunss | noun | A lack of harmony or agreement, especially between elements, ideas, or musical notes. | From French dissonance, from Latin dissonare (to differ in sound). |
| 202 | Eclectic | ih-KLEK-tik | adjective | Deriving ideas, style, or taste from a broad and diverse range of sources. | From Greek eklektikos, from eklegein (to pick out, select). |
| 203 | Efficacy | EF-ih-kuh-see | noun | The ability to produce a desired or intended result. | From Latin efficacia, from efficax (effectual, powerful). |
| 204 | Effrontery | uh-FRUN-tuh-ree | noun | Insolent or impertinent behaviour. | From French effronterie, from effronté (shameless, literally un-browed). |
| 205 | Effusive | uh-FYOO-siv | adjective | Showing or expressing gratitude, pleasure, or approval in an unrestrained or heartfelt manner. | From Latin effusus, from effundere (to pour out). |
| 206 | Egregious | ih-GREE-jus | adjective | Outstandingly bad, shocking, or flagrant. | From Latin egregious (distinguished, literally standing out from the flock). |
| 207 | Elicit | ih-LIS-it | verb | To evoke or draw out a reaction, answer, or fact from someone. | From Latin elicitus, from elicere (to draw out, entice). |
| 208 | Elucidate | ih-LOO-sih-dayt | verb | To make something clear, or to explain it thoroughly. | From Late Latin elucidatus, from lux (light). |
| 209 | Eloquent | EL-uh-kwunt | adjective | Fluent or persuasive in speaking or writing. | From Latin eloquentem, from eloqui (to speak out). |
| 210 | Emollient | ih-MOL-yunt | adjective | Having a quality that soothes or softens the skin, or attempting to placate a tense situation. | From Latin emollientem, from emollire (to make soft). |
| 211 | Empirical | em-PIR-ih-kul | adjective | Based on, concerned with, or verifiable by observation or experience rather than theory. | From Greek empeirikos, from empeiria (experience). |
| 212 | Encomium | en-KOH-mee-um | noun | A formal expression of high praise or a laudatory speech. | From Greek enkomion, from en- (in) + komos (revelry, banquet). |
| 213 | Endemic | en-DEM-ik | adjective | Regularly found among particular people or in a certain area. | From Greek endemos, from en- (in) + demos (people). |
| 214 | Engender | en-JEN-dur | verb | To cause or give rise to a feeling, situation, or condition. | From Old French engendrer, from Latin ingenerare (to produce within). |
| 215 | Enigma | uh-NIG-muh | noun | A person or thing that is mysterious, puzzling, or difficult to understand. | From Greek ainigma, from ainissesthai (to speak in riddles). |
| 216 | Enmity | EN-mih-tee | noun | A state or feeling of active opposition or hostility. | From Old French enemistie, based on Latin inimicus (enemy). |
| 217 | Equivocal | ih-KWIV-uh-kul | adjective | Open to more than one interpretation, ambiguous, or uncertain. | From Late Latin aequivocus, from aequus (equal) + vocare (to call). |
| 218 | Erudite | ER-yoo-dyt | adjective | Having or showing great knowledge or learning. | From Latin eruditus, from erudire (to instruct, literally to bring out of the rough). |
| 219 | Esoteric | ess-oh-TER-ik | adjective | Intended for or likely to be understood by only a small number of people with a specialised knowledge. | From Greek esōterikos, from esōterō (inner). |
| 220 | Euphemism | YOO-fuh-miz-um | noun | A mild or indirect word or expression substituted for one considered to be too harsh or blunt. | From Greek euphemismos, from eu- (good) + pheme (speaking). |
| 221 | Exacerbate | ig-ZAS-er-bayt | verb | To make a problem, bad situation, or negative feeling worse. | From Latin exacerbatus, from ex- (thoroughly) + acerbus (bitter, harsh). |
| 222 | Exculpate | EK-skul-payt | verb | To show or declare that someone is not guilty of a wrongdoing. | From Medieval Latin exculpatus, from ex- (out) + culpa (blame, fault). |
| 223 | Exigent | EK-sih-junt | adjective | Pressing or demanding, requiring immediate attention or action. | From Latin exigentem, from exigere (to demand, drive out). |
| 224 | Exonerate | ig-ZON-uh-rayt | verb | To officially absolve someone from blame or a formal charge. | From Latin exoneratus, from ex- (un-) + onus (a burden). |
| 225 | Expound | ik-SPOUND | verb | To explain the meaning of a theory or idea in detail. | From Old French espondre, from Latin exponere (to put out, set forth). |
| 226 | Facetious | fuh-SEE-shus | adjective | Treating serious issues with deliberately inappropriate humour. | From French facétieux, from Latin facetia (a witty saying, cleverness). |
| 227 | Facile | FASS-byl | adjective | Ignoring the true complexities of an issue to present an oversimplified opinion. | From French facile, from Latin facilis (easy, convenient, easily done). |
| 228 | Factious | FAK-shus | adjective | Relating to or caused by a state of intense internal dissension. | From Latin factiosus, from factio (a political clique or group). |
| 229 | Factitious | fak-TISH-us | adjective | Artificially created or developed rather than arising naturally. | From Latin facticius, from facere (to do, make). |
| 230 | Fallacious | fuh-LAY-shus | adjective | Based on a mistaken belief or faulty reasoning. | From Latin fallaciosus, from fallacia (deceit, trick, deception). |
| 231 | Fastidious | fuh-STID-ee-us | adjective | Very attentive to and concerned about accuracy, cleanliness, and detail. | From Latin fastidiosus, from fastidium (loathing, disgust, squeamishness). |
| 232 | Fealty | FEE-ul-tee | noun | The formal acknowledgement of loyalty owed to a feudal lord or sovereign body. | From Old French fealte, from Latin fidelitas (faithfulness). |
| 233 | Feckless | FEK-luss | adjective | Lacking initiative or strength of character, irresponsible and incompetent. | From Scots feck (effect, value) + -less (without). |
| 234 | Felicitous | fuh-LIS-ih-tus | adjective | Well-chosen or suited to the circumstances, or bringing good fortune. | From Latin felicitas, from felix (happy, fruitful, lucky). |
| 235 | Fervid | FUR-vid | adjective | Intensely enthusiastic or passionate, or burning hot. | From Latin fervidus, from fervere (to boil, glow, rage). |
| 236 | Fetter | FET-ur | verb | To restrain or chain someone up, or to restrict their personal freedom. | From Old English feter, from Proto-Germanic feterō (a shackle for the foot). |
| 237 | Florid | FLOR-id | adjective | Having a red or flushed complexion, or excessively complicated and ornate. | From Latin floridus, from flos (flower). |
| 238 | Foment | foh-MENT | verb | To instigate or stir up an undesirable or violent sentiment. | From French fomenter, from Latin fomentum (a warm poultice, lotion, or instigation). |
| 239 | Furtive | FUR-tiv | adjective | Attempting to avoid notice or attention, typically because of guilt. | From French furtif, from Latin furtivus (stolen, secret, hidden). |
| 240 | Gainsay | gayn-SAY | verb | To deny, contradict, or speak against a fact or statement. | From Middle English gayn- (against) + sayen (to say). |
| 241 | Garish | GAIR-ish | adjective | Obtrusively bright and showy, lurid or gaudy. | From obsolete Middle English gauren (to stare), perhaps from Old Norse. |
| 242 | Genial | JEE-nee-ul | adjective | Friendly, cheerful, and pleasant in manner. | From Latin genialis (festive, pleasant, jovial), from genius (spirit). |
| 243 | Gibe | JYB | noun | An insulting or mocking remark, a taunt. | Perhaps from Old French giber (to handle roughly, shake, kick). |
| 244 | Glib | GLIB | adjective | Fluent and voluble but insincere and shallow. | From Dutch or Low German glibberig (slippery) or glip (to slip). |
| 245 | Gregarious | grih-GAIR-ee-us | adjective | Fond of company, highly sociable. | From Latin gregarius, from grex (a flock, herd, pack). |
| 246 | Guile | GYL | noun | Sly or cunning intelligence, duplicity. | From Old French guile (deceit, fraud, trickery), probably from a Germanic source. |
| 247 | Hackneyed | HAK-need | adjective | Having been overused to the point of lacking significance or originality. | From the place name Hackney, from the use of its horses for ordinary hire, leading to the sense of commonplace. |
| 248 | Halcyon | HAL-see-un | adjective | Denoting a period of time in the past that was idyllically happy and peaceful. | From Greek alkuon (kingfisher), a mythical bird said to breed in a nest floating on the sea at the winter solstice, charming the wind and waves into calm. |
| 249 | Harangue | huh-RANG | noun | A lengthy and aggressive speech, a loud tirade. | From Old French arenge, from Medieval Latin harenga, from a Germanic root meaning a public horse-ring or circle of spectators. |
| 250 | Harrowing | HAR-oh-ing | adjective | Acutely distressing or deeply upsetting. | From Middle English harewen, from Old English heargian (to ravage, despoil), based on the action of a harrow breaking up clods of earth. |
| 251 | Haughty | HAW-tee | adjective | Arrogantly superior and disdainful, showing blatant pride. | From Old French haughty, from haut (high), based on Latin altus. |
| 252 | Hedonism | HEE-dun-iz-um | noun | The ethical theory that pleasure is the highest good and proper aim of human life. | From Greek hedone (pleasure), from hedys (sweet). |
| 253 | Heinous | HAY-nus | adjective | Utterly odious or wicked, especially of a crime or sin. | From Old French hainous, from hair (to hate). |
| 254 | Hermetic | hur-MET-ik | adjective | Complete and airtight, or isolated from outside influence. | From Modern Latin hermeticus, from Hermes Trismegistus, the mythical founder of alchemy who invented a magical seal for vessels. |
| 255 | Hiatus | hy-AY-tus | noun | A pause or break in continuity in a sequence or activity. | From Latin hiatus, from hiare (to gape, open wide). |
| 256 | Histrionic | hiss-tree-ON-ik | adjective | Excessively theatrical or dramatic in character or style. | From Late Latin histrionicus, from Latin histrio (an actor). |
| 257 | Homily | HOM-ih-lee | noun | A religious discourse that is intended primarily for spiritual edification, or a tedious moral lecture. | From Greek homilia, from homilos (a crowd, assembly). |
| 258 | Hubris | HYOO-bris | noun | Excessive pride or dangerous self-confidence, often leading to a downfall. | From Greek hubris (wanton insolence, outrage, assault). |
| 259 | Hyperbole | hy-PUR-buh-lee | noun | Exaggerated statements or claims not meant to be taken literally. | From Greek huperbole, from huper- (over) + ballein (to throw). |
| 260 | Hypocrisy | hih-POK-rih-see | noun | The practice of claiming to have higher moral standards than one actually possesses. | From Old French ypocrisie, from Greek hupokrisis (acting a part, pretense, literally answering behind a mask). |
| 261 | Iconoclast | eye-KON-uh-klast | noun | A person who attacks cherished beliefs or established institutions. | From Greek eikonoklastes, from eikon (image) + klan (to break). |
| 262 | Idiosyncrasy | id-ee-oh-SING-kruh-see | noun | A mode of behaviour or way of thinking peculiar to an individual. | From Greek idiosunkrasia, from idios (own, peculiar) + sun (with) + krasis (mixture). |
| 263 | Idolatry | eye-DOL-uh-tree | noun | The worship of idols, or extreme admiration and reverence for something. | From Old French idolatrie, from Greek eidololatria, from eidolon (image, phantom) + latreia (worship). |
| 264 | Illusion | ih-LOO-zhun | noun | An instance of a wrong or misinterpreted perception of a sensory experience. | From Latin illusio, from illudere (to mock, trick, literally to play with). |
| 265 | Immutable | ih-MYOO-tuh-bul | adjective | Unchanging over time or unable to be changed. | From Latin immutabilis, from in- (not) + mutare (to change). |
| 266 | Impassioned | im-PASH-und | adjective | Filled with or showing great emotion or intense feeling. | From Italian impassionation, from Latin in- (into) + passio (suffering, passion). |
| 267 | Impeccable | im-PEK-uh-bul | adjective | In accordance with the highest standards, faultless or sinless. | From Latin impeccabilis, from in- (not) + peccare (to sin). |
| 268 | Imperious | im-PEER-ee-us | adjective | Arrogant and domineering, expecting immediate obedience without question. | From Latin imperiosus, from imperium (command, supreme power, empire). |
| 269 | Imperturbable | im-pur-TUR-buh-bul | adjective | Incapable of being upset or agitated, naturally calm and serene. | From Late Latin imperturbabilis, from in- (not) + perturbare (to confuse, disturb). |
| 270 | Impervious | im-PUR-vee-us | adjective | Not allowing fluid to pass through, or unable to be affected by something. | From Latin impervius, from in- (not) + pervius (letting things through). |
| 271 | Impetuous | im-PET-yoo-us | adjective | Acting or done quickly and without thought or care. | From Old French impetueux, from Late Latin impetuosus, from impetus (an attack, impulse). |
| 272 | Implacable | im-PLAK-uh-bul | adjective | Unable to be placated, appeased, or significantly modified. | From Latin implacabilis, from in- (not) + placare (to appease). |
| 273 | Importunate | im-POR-choo-nut | adjective | Persistent and demanding, especially to the point of annoyance. | From Latin importunus (unsuitable, troublesome, literally having no harbor). |
| 274 | Imprecation | im-prih-KAY-shun | noun | A spoken curse or insult. | From Latin imprecatio, from imprecari (to invoke evil upon, pray to). |
| 275 | Impregnable | im-PREG-nuh-bul | adjective | Incapable of being taken by assault, unconquerable. | From Old French imprenable, from in- (not) + prendre (to take), from Latin prehendere. |
| 276 | Improvident | im-PROV-ih-dunt | adjective | Not having or showing foresight, spendthrift or thoughtless. | From Latin improvidens, from in- (not) + providere (to foresee, look ahead). |
| 277 | Impugn | im-PYOON | verb | To dispute the truth, validity, or honesty of a statement or motive. | From Latin impugnare, from in- (against) + pugnare (to fight). |
| 278 | Imputation | im-pyoo-TAY-shun | noun | A charge or insinuation that someone has done something criminal or dishonourable. | From Latin imputatio, from imputare (to bring into the reckoning, charge). |
| 279 | Inadvertent | in-ad-VUR-tunt | adjective | Not resulting from or achieved through deliberate planning, unintentional. | From Latin in- (not) + advertentem, from advertere (to turn the mind to). |
| 280 | Inane | ih-NAYN | adjective | Lacking sense or substance, silly or mindless. | From Latin inanis (empty, void, worthless, useless). |
| 281 | Inchoate | in-KOH-ut | adjective | Just begun and so not fully formed or developed, rudimentary. | From Latin inchoatus, from inchoare (to begin, construct, lay foundations). |
| 282 | Incipient | in-SIP-ee-unt | adjective | Beginning to happen or develop, appearing or growing. | From Latin incipientem, from incipere (to take in hand, begin). |
| 283 | Inclement | in-KLEM-unt | adjective | Denoting weather that is unpleasantly cold, wet, or severe. | From Latin inclemens, from in- (not) + clemens (mild, gentle). |
| 284 | Jaded | JAY-did | adjective | Bored or lacking enthusiasm, typically after overexposure to something. | From Middle English jade (a worn-out horse, nag). |
| 285 | Jargon | JAR-gun | noun | Specialised expressions used by a particular profession that are difficult for others to understand. | From Old French jargon (chatter of birds, meaningless talk). |
| 286 | Jaundiced | JAWN-dist | adjective | Affected by bitterness, resentment, or cynicism. | From French jaunisse (yellowness), from jaune (yellow). |
| 287 | Jaunty | JAWN-tee | adjective | Having or expressing a lively, cheerful, and self-confident manner. | From French gentil (well-born, noble, graceful). |
| 288 | Jeopardise | JEP-uh-dyz | verb | To put someone or something into a situation in which there is a danger of loss or failure. | From Old French jeu parti (a divided or even game). |
| 289 | Jettison | JET-ih-sun | verb | To throw or drop something from an aircraft or ship, or to abandon an unwanted plan. | From Old French getaison, from Latin jactatio (a throwing). |
| 290 | Jocular | JOK-yoo-lur | adjective | Fond of or characterised by joking, humorous or playful. | From Latin jocularis, from joculus, a diminutive of jocus (joke, jest). |
| 291 | Jovial | JOH-vee-ul | adjective | Cheerful and friendly in disposition. | From French jovial, from Italian joviale (born under the lucky influence of the planet Jupiter). |
| 292 | Judicious | joo-DISH-us | adjective | Having, showing, or done with good judgment or sense. | From French judicieux, from Latin judicium (judgment). |
| 293 | Juncture | JUNK-chur | noun | A particular point in events or time, especially a critical one. | From Latin junctura (a joint, joining), from jungere (to join). |
| 294 | Ken | KEN | noun | One's range of knowledge or sight. | From Middle English kennen, from Old English cennan (to make known, declare), from Proto-Germanic kannjan. |
| 295 | Kernel | KUR-nul | noun | The central or most important part of something, or the edible seed within a nut casing. | From Old English cyrnel, a diminutive of corn (grain, seed). |
| 296 | Kindle | KIN-dul | verb | To arouse or inspire an emotion, or to light a fire. | From Middle English kindlen, from Old Norse kynda (to light a fire, inflame). |
| 297 | Kinship | KIN-ship | noun | A sharing of characteristics or origins, or blood relationship. | From Old English cynn (family, race, nature) + the suffix -ship (state, condition). |
| 298 | Kismet | KIZ-met | noun | Destiny or fate. | From Turkish kısmet, from Arabic qismah (portion, lot, division, fate). |
| 299 | Knell | NEL | noun | The sound of a bell, especially when rung solemnly for a death or funeral. | From Old English cnyll (sound of a bell), from cnyllan (to strike sound out, ring). |
| 300 | Kowtow | kow-TOW | verb | To act in an excessively subservient or sycophantic manner. | From Chinese koutou, from kou (knock) + tou (head). |
| 301 | Labile | LAY-byl | adjective | Liable to increased change, unstable or emotionally volatile. | From Latin labilis, from labi (to slip, fall, or glide). |
| 302 | Lampoon | lam-POON | verb | To publicly criticise someone or something by using ridicule, irony, or sarcasm. | From French lamponner, from lampon (a drinking song refrain, literally let us drink). |
| 303 | Languid | LANG-gwid | adjective | Displaying or having a disinclination for physical exertion or effort, slow and relaxed. | From Latin languidus, from languere (to be faint, weary, or sluggish). |
| 304 | Largesse | lar-ZHESS | noun | Generosity in bestowing money or gifts upon others. | From Old French largesse, from Latin largus (abundant, plentiful, bountiful). |
| 305 | Lassitude | LASS-ih-tyood | noun | A state of physical or mental weariness, lack of energy. | From Latin lassitudo, from lassus (faint, weary, tired). |
| 306 | Laudable | LAW-duh-bul | adjective | Deserving praise and commendation. | From Latin laudabilis, from laudare (to praise, extol, or approve). |
| 307 | Levity | LEV-ih-tee | noun | The treatment of a serious matter with humour or lack of due respect. | From Latin levitas, from levis (light in weight). |
| 308 | Litany | LIT-uh-nee | noun | A tedious recital or repetitive series of grievances or statements. | From Old French letanie, from Greek litaneia (prayer, supplication). |
| 309 | Liturgy | LIT-ur-jee | noun | A customised form or formulation according to which public religious worship is conducted. | From French liturgie, from Greek leitourgia (public work, state service). |
| 310 | Luminous | LOO-mih-nus | adjective | Full of or shedding light, bright or shining, especially in the dark. | From Latin luminosus, from lumen (light). |
| 311 | Macabre | muh-KAH-bruh | adjective | Disturbing and horrifying because of involvement with or depiction of death and injury. | From French macabre, from the phrase Danse Macabre (the dance of death). |
| 312 | Malaise | muh-LAYZ | noun | A general feeling of discomfort, illness, or unease whose exact cause is difficult to identify. | From French malaise, from mal (bad) + aise (ease). |
| 313 | Malleable | MAL-ee-uh-bul | adjective | Able to be hammered or pressed into shape without breaking, or easily influenced. | From Medieval Latin malleabilis, from malleus (a hammer). |
| 314 | Martinet | mar-tih-NET | noun | A strict disciplinarian, especially in the armed forces or an office. | Named after Jean Martinet, a seventeenth-century French army colonel notorious for his rigid drill systems. |
| 315 | Maudlin | MAWD-lin | adjective | Self-pitying or tearfully sentimental, often through drunkenness. | From an alteration of Mary Magdalene, who was traditionally depicted weeping in medieval art. |
| 316 | Maverick | MAV-er-ik | noun | An unorthodox or independent-minded person who refuses to follow standard rules. | Named after Samuel Maverick, a nineteenth-century Texas rancher who refused to brand his cattle. |
| 317 | Mendacious | men-DAY-shus | adjective | Not telling the truth, lying or deceitful. | From Latin mendax (lying, false, deceptive), from menda (a fault or blemish). |
| 318 | Mercurial | mur-KYOO-ree-ul | adjective | Subject to sudden or unpredictable changes of mood or mind. | From Latin mercurialis (relating to the god Mercury or planet Mercury, astrological source of volatility). |
| 319 | Meticulous | muh-TIK-yoo-lus | adjective | Showing great attention to detail, very careful and precise. | From Latin meticulosus (fearful, timid, literally full of fear). |
| 320 | Mitigate | MIT-ih-gayt | verb | To make something bad less severe, serious, or painful. | From Latin mitigatus, from mitigare (to soften, pacify, or make mild). |
| 321 | Modicum | MOD-ih-kum | noun | A small quantity of a particular thing, especially something desirable. | From Latin modicum (a little, a small piece), from modus (measure). |
| 322 | Mollify | MOL-ih-fy | verb | To appease the anger or anxiety of someone. | From French mollifier, from Latin mollificare, from mollis (soft). |
| 323 | Moribund | MOR-ih-bund | adjective | At the point of death, or in terminal decline, lacking vitality. | From Latin moribundus, from mori (to die). |
| 324 | Munificent | myoo-NIF-ih-sent | adjective | Characterised by or showing great generosity. | From Latin munificentia, from munus (a gift, service, or duty) + facere (to do or make). |
| 325 | Nadir | NAY-deer | noun | The lowest point in the fortunes of a person or organisation. | From Arabic nazir (opposite, counterpart, literally opposite the zenith). |
| 326 | Nascent | NAY-sunt | adjective | Just coming into existence and beginning to display signs of future potential. | From Latin nascentem, from nasci (to be born). |
| 327 | Nefarious | nih-FAIR-ee-us | adjective | Wicked, impious, or criminal in behaviour. | From Latin nefarious, from nefas (an impiety, crime against divine law, from ne- not + fas divine right). |
| 328 | Neophyte | NEE-oh-fyt | noun | A person who is new to a subject, skill, or belief, a novice. | From ecclesiastical Latin neophytes, from Greek neophutos (literally newly planted). |
| 329 | Obfuscate | OB-fus-kayt | verb | To deliberately make something obscure, unclear, or unintelligible. | From Late Latin obfuscatus, from ob- (over) + fuscus (dark). |
| 330 | Obsequious | ub-SEE-kwee-us | adjective | Obedient or attentive to an excessive or servile degree. | From Latin obsequiosus, from obsequium (compliance, from ob- after + sequi to follow). |
| 331 | Paradigmatic | pa-ruh-dig-MAT-ik | adjective | Serving as a typical example or model of something. | From Greek paradeigmatikos, from paradeigma (a pattern, model, or sample). |
| 332 | Paucity | PAW-sih-tee | noun | The presence of something only in small or insufficient quantities or amounts. | From Old French paucite, from Latin paucitas, from paucus (few, little, or small). |
| 333 | Pedantic | peh-DAN-tik | adjective | Excessively concerned with minor details or rules, especially in displaying academic learning. | From French pédantesque, from Italian pedante (a schoolteacher, schoolmaster). |
| 334 | Penury | PEN-yoo-ree | noun | The state of extreme poverty, destitution. | From Latin penuria (scarcity, want, need, or poverty). |
| 335 | Philistine | FIL-ih-styne | noun | A person who is hostile or smugly indifferent to culture, the arts, and intellect. | From German Philister, in reference to the ancient biblical enemies of the Israelites, used by university students to describe uncultured townspeople. |
| 336 | Pithy | PITH-ee | adjective | Brief, forceful, and full of vigor and substance in expression. | From Old English pitha (the essential core substance or soft center of a plant stem). |
| 337 | Placated | pluh-KAY-tid | verb | Appeased or pacified, making someone less angry or hostile. | From Latin placatus, from placare (to soothe, quiet, or appease). |
| 338 | Plethora | PLETH-uh-ruh | noun | An excess or large overabundance of something. | From Late Latin plethora, from Greek plethore (fullness, repletion, from plethein to be full). |
| 339 | Polemical | puh-LEM-ih-kul | adjective | Relating to or involving strongly critical, controversial, or disputatious writing or speech. | From Greek polemikos (bellicose, hostile, relating to war), from polemos (war). |
| 340 | Pragmatic | prag-MAT-ik | adjective | Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations. | From Latin pragmaticus, from Greek pragmatikos (relating to business, active, from pragma deed). |
| 341 | Precarious | prih-KAIR-ee-us | adjective | Not securely held or in position, dangerously likely to fall or collapse. | From Latin precarius (obtained by entreaty or prayer, dependent on the will of another, risky). |
| 342 | Proclivity | pruh-KLIV-ih-tee | noun | A tendency to choose or do something regularly, an inclination or predisposition. | From Latin proclivitas, from proclivis (inclined, sloping forward, from pro- forward + clivus a slope). |
| 343 | Prodigal | PROD-ih-gul | adjective | Spending money or resources freely and recklessly, wastefully extravagant. | From Late Latin prodigalis, from Latin prodigus (lavish, wasteful, from prodigere to drive forth or squander). |
| 344 | Profound | pruh-FOUND | adjective | Having or showing great knowledge, insight, or deep intensity. | From Old French parfond, from Latin profundus (deep, vast, literally before the bottom). |
| 345 | Punctilious | pungk-TIL-ee-us | adjective | Showing great attention to detail or correct behaviour. | From French pointilleux, from Italian puntiglio (a fine point, diminutive of punto point, from Latin punctum). |
| 346 | Rancour | RANG-kur | noun | Bitterness or resentfulness, especially when long-standing. | From Old French rancour, from Late Latin rancor (sourness, stinking, or grudge). |
| 347 | Remiss | rih-MIS | adjective | Lacking care or attention to duty, negligent. | From Latin remissus (slack, relaxed, languid, from remittere to send back). |
| 348 | Reprobate | REP-ruh-bayt | noun | An unprincipled person, rogue, or rascal. | From Latin reprobatus, from reprobare (to disapprove, reject, from re- opposite + probare to prove good). |
| 349 | Resilient | rih-ZIL-ee-unt | adjective | Able to recoil or spring back into shape after bending, or able to recover quickly from difficult conditions. | From Latin resilientem, from resilire (to leap back, bounce, from re- back + salire to jump). |
| 350 | Reticent | RET-ih-sunt | adjective | Not revealing one's thoughts or feelings readily, reserved. | From Latin reticentem, from reticere (to keep silent, from re- intensive + tacere to be silent). |
| 351 | Sagacious | suh-GAY-shus | adjective | Having or showing keen mental discernment and good judgment, shrewd. | From Latin sagax (keen-scented, acute, shrewd, from sagire to perceive keenly). |
| 352 | Salubrious | suh-LOO-bree-us | adjective | Health-giving or pleasant, clean and wholesome to inhabit. | From Latin salubris, from salus (health, safety, or greeting). |
| 353 | Scrupulous | SKROO-pyoo-lus | adjective | Thorough, attentive, and extremely careful, or having high moral integrity. | From Latin scrupulosus, from scrupulus (a small sharp stone, cause of anxiety, diminutive of scrupus rough pebble). |
| 354 | Sedulous | SED-yoo-lus | adjective | Showing dedication and diligent, persistent effort. | From Latin sedulus (busy, diligent, or zealous), probably from se- (without) + dolo (deceit or trickery). |
| 355 | Specious | SPEE-shus | adjective | Superficially plausible, but actually wrong or incorrect. | From Latin speciosus (beautiful, fair, or plausible), from species (appearance, look). |
| 356 | Spurious | SPYOO-ree-us | adjective | Not being what it purports to be, false or fake. | From Latin spurius (false, illegitimate, or sham). |
| 357 | Stagnant | STAG-nunt | adjective | Having no current or flow, often having an unpleasant smell, or sluggish. | From Latin stagnantem, from stagnare (to form a pool of standing water, from stagnum pool). |
| 358 | Staid | STAYD | adjective | Sedate, respectable, and unadventurous in character or manner. | An archaic spelling of stayed, the past participle of the verb stay (to stop or remain fixed). |
| 359 | Stoic | STOH-ik | noun | A person who can endure pain or hardship without showing their feelings or complaining. | From Greek stoikos, from stoa (the painted porch or colonnade in Athens where the philosopher Zeno taught). |
| 360 | Stratagem | STRAT-uh-jem | noun | A plan or scheme, especially one used to outwit an opponent or achieve a purpose. | From French stratagème, from Greek strategema (a general's trick, piece of generalship, from strategos general). |
| 361 | Strident | STRY-dunt | adjective | Loud and harsh, grating or piercing in sound, or presenting a point of view aggressively. | From Latin stridentem, from stridere (to creak, hiss, or shriek). |
| 362 | Succinct | suk-SINGKT | adjective | Briefly and clearly expressed, concise. | From Latin succinctus (girded, tucked up, short, from sub- up + cingere to gird). |
| 363 | Supercilious | soo-pur-SIL-ee-us | adjective | Behaving or looking as though one thinks one is superior to others, arrogant. | From Latin superciliosus, from supercilium (eyebrow, from super- above + cilium eyelid, used to denote haughty expressions arrival). |
| 364 | Surreptitious | suh-rep-TISH-us | adjective | Kept secret, especially because it would not be approved of. | From Latin surrepticius, from surripere (to seize secretly, from sub- secretly + rapere to snatch). |
| 365 | Taciturn | TAS-ih-turn | adjective | Reserved or uncommunicative in speech, saying little. | From French taciturne, from Latin taciturnus, from tacitus (silent). |
| 366 | Terse | TURSS | adjective | Sparing in the use of words, abrupt or concise. | From Latin tersus (wiped smooth, clean, or neat, from tergere to wipe). |
| 367 | Torpid | TOR-pid | adjective | Mentally or physically inactive, lethargic. | From Latin torpidus, from torpere (to be numb, stiff, or paralyzed). |
| 368 | Tortuous | TOR-choo-us | adjective | Full of twists and turns, or excessively lengthy and complex. | From Old French tortueux, from Latin tortuosus, from tortus (a twisting, from torquere to twist). |
| 369 | Tractable | TRAK-tuh-bul | adjective | Easy to control or influence, docile or pliant. | From Latin tractabilis, from tractare (to handle, manage, from trahere to draw or pull). |
| 370 | Transient | TRAN-zee-unt | adjective | Lasting only for a short time, impermanent or fleeting. | From Latin transientem, from transire (to go across, from trans- across + ire to go). |
| 371 | Ubiquitous | yoo-BIK-wih-tus | adjective | Present, appearing, or found everywhere. | From modern Latin ubiquitas, from ubique (everywhere). |
| 372 | Umbrage | UM-brij | noun | Offence or annoyance, typically taken at a remark or action. | From Old French ombrage, from Latin umbra (shadow, shade). |
| 373 | Unprecedented | un-PRESS-ih-den-tid | adjective | Never done or known before, completely novel. | From English un- (not) + precedent, from Latin praecedere (to go before). |
| 374 | Upbraid | up-BRAYD | verb | To find fault with someone, or to scold them severely. | From Old English upgebregdan, from up- (up) + bregdan (to move quickly, pull, or weave). |
| 375 | Urbane | ur-BAYN | adjective | Courteous, refined, and sophisticated in manner, typically of a man. | From Latin urbanus (belonging to a city, sophisticated, from urbs city). |
| 376 | Usurp | yoo-ZURP | verb | To take a position of power or importance illegally or by force. | From Latin usurpare (to seize for use, take possession of, from usus use + rapere to seize). |
| 377 | Vacuous | VAK-yoo-us | adjective | Having or showing a complete lack of thought or intelligence, empty. | From Latin vacuus (empty, free, vacant, or void). |
| 378 | Vagary | VAY-guh-ree | noun | An unexpected and inexplicable change in a situation or in someone's behaviour. | Probably from Latin vagari (to wander, roam, or stroll). |
| 379 | Vapid | VAP-id | adjective | Offering nothing that is stimulating or challenging, dull or insipid. | From Latin vapidus (stale, flat, having lost life, from vappa stale wine). |
| 380 | Variegated | VAIR-ee-uh-gay-tid | adjective | Exhibiting different colours, especially as irregular patches or streaks. | From Latin variegatus, from variegare (to make varied, from varius diverse + agere to make). |
| 381 | Vehement | VEE-uh-munt | adjective | Showing strong feeling, forceful, passionate, or intense. | From French véhément, from Latin vehementem (impetuous, violent, literally carried away). |
| 382 | Veracity | vuh-RASS-ih-tee | noun | Conformity to facts, accuracy or truthfulness. | From French véracité, from Latin verax (true, truthful, from verus true). |
| 383 | Verbiage | VUR-bee-ij | noun | Excessively lengthy or technical speech or writing, padding. | From French verbiage, from Old French verboier (to chatter, from verbe word). |
| 384 | Vestige | VES-tij | noun | A trace of something that is disappearing or no longer exists. | From French vestige, from Latin vestigium (a footprint, track, or trace). |
| 385 | Vindicate | VIN-dih-kayt | verb | To clear someone of blame or suspicion, or to prove a claim correct. | From Latin vindicatus, from vindicare (to lay claim to, avenge, or clear, from vim dicare to declare force). |
| 386 | Wane | WAYN | verb | To decrease in vigor, power, or size, to decline or fade. | From Old English wanian (to lessen, diminish, or make smaller), from Proto-Germanic wanon. |
| 387 | Wary | WAIR-ee | adjective | Feeling or showing caution about possible dangers or problems. | From Old English war (prudent, aware, or alert), from Proto-Germanic waraz. |
| 388 | Wizened | WIZ-und | adjective | Shriveled or wrinkled with age. | From Old English wisenian (to wither, dry up, or fade), from Proto-Germanic wison. |
| 389 | Xenophobia | zen-uh-FOH-bee-uh | noun | Dislike of or prejudice against people from other countries. | Coined in nineteenth-century English from Greek xenos (stranger, guest) + phobos (fear). |
| 390 | Zealot | ZEL-ut | noun | A person who is fanatical and uncompromising in pursuit of their religious or political ideals. | From ecclesiastical Latin zelotes, from Greek zelotes, from zelos (zeal, jealousy, or fervor). |
| 391 | Zenith | ZEN-ith | noun | The time at which something is at its most powerful or successful, the absolute peak. | From Old French cenith, from Arabic samt (path, track, literally path over the head). |
| 392 | Yclept | ih-KLEPT | adjective | Named or called, used chiefly in literary or playful writing. | From Middle English icleped, past participle of clepen (to call, name), from Old English clēopan (to call). |
| 393 | Ylem | EE-lem | noun | In cosmology, hypothetical primordial matter from which the chemical elements were formed. | From medieval Latin hylem, accusative of hyle (matter), from Greek hylē (wood, material, matter). |
| 394 | Yonder | YON-der | adverb | At or to a distance, but within sight; over there. | From Middle English yond, from Old English geond (beyond, over there). |
| 395 | Yore | YOR | noun | Time long past, especially as remembered in story, song, or tradition. | From Old English geara (of yore), related to gear (year, season). |
