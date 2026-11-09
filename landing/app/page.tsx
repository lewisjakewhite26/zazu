import { Footer, Nav, WAITLIST } from "@/components/site/Brand";
import Screen from "@/components/site/Screen";

const WORDS = [
  {
    word: "Petrichor",
    meta: "PET-ri-kor · noun",
    def: "The pleasant earthy smell that rises from dry ground when rain falls after a dry spell.",
    origin: "Coined in 1964 from Greek petros (stone) and ichor, the fluid said to run in the veins of the gods.",
  },
  {
    word: "Laconic",
    meta: "luh-KON-ik · adjective",
    def: "Using very few words; brief and concise in speech or expression.",
    origin: "From Laconia, home of the Spartans, who were famous for brief, blunt replies.",
  },
  {
    word: "Mellifluous",
    meta: "meh-LIF-loo-us · adjective",
    def: "Sweet or musical; pleasant to hear.",
    origin: "From Latin mel (honey) and fluere (to flow): literally, flowing with honey.",
  },
  {
    word: "Halcyon",
    meta: "HAL-see-un · adjective",
    def: "Denoting a period of time in the past that was idyllically happy and peaceful.",
    origin: "From Greek alkuon, the kingfisher, a mythical bird said to calm the sea while it nested.",
  },
];

const FAQS = [
  {
    q: "Does the alarm still ring on silent or Do Not Disturb?",
    a: "Yes. Zazu rings on your phone's alarm channel, the same one the built-in clock uses, so it follows your alarm volume and sounds on silent, on vibrate and in Do Not Disturb.",
  },
  {
    q: "What happens when the alarm goes off?",
    a: "Your word for the day appears over the lock screen. Tap “I'm awake” to stop the sound, read what the word means and where it comes from, then answer one quick question to finish. Hold the snooze button if you need a few more minutes.",
  },
  {
    q: "What if I get the question wrong?",
    a: "You just try again. Nothing resets, and nothing locks you out.",
  },
  {
    q: "Do I need an account?",
    a: "No. Everything in the free app works as a guest, and your progress stays on your phone. Sign in with Google if you want it backed up and synced across devices.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The daily alarm, nearly 400 words and the Word Gym are free, with no adverts and no tracking. Zazu Gold, coming soon, adds themed word packs for people who want more.",
  },
  {
    q: "Which phones does it work on?",
    a: "Android, through Google Play. There isn't an iPhone version.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="hero dawn">
          <div className="wrap hero-grid">
            <div>
              <h1 className="display rise">
                A new word
                <br />
                <em>every morning.</em>
              </h1>
              <p className="lede rise rise-2">
                Zazu is an alarm clock that teaches you one word before the day starts. It goes off, you meet the
                word, and one quick question gets you up.
              </p>
              <div className="rise rise-3">
                <a href={WAITLIST} className="btn">Join the waitlist</a>
                <p className="small hero-note">Coming soon to Google Play. Free, with no ads.</p>
              </div>
            </div>
            <div className="hero-phone">
              <div className="rise rise-2">
                <Screen name="alarm" alt="Zazu's alarm screen showing today's word, Paucity, over the lock screen" priority />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <div className="section-head">
              <h2 className="h2">How a morning works</h2>
              <p className="lede">About a minute, start to finish. Long enough to remember the word, short enough to do half asleep.</p>
            </div>
            <div className="morning">
              <figure>
                <Screen name="alarm" alt="The alarm screen with today's word" />
                <figcaption>
                  <h3>The alarm goes off</h3>
                  <p>A gentle chime, and today&rsquo;s word over your lock screen.</p>
                </figcaption>
              </figure>
              <figure>
                <Screen name="learn" alt="The learn screen with the word's meaning and etymology" />
                <figcaption>
                  <h3>You learn it</h3>
                  <p>What it means, and where it came from.</p>
                </figcaption>
              </figure>
              <figure>
                <Screen name="task" alt="The morning task: tap the word in a sentence" />
                <figcaption>
                  <h3>One question, and you&rsquo;re up</h3>
                  <p>Spot the word in a real sentence. The alarm stops, and the word stays with you.</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2 className="h2">Words worth waking up for</h2>
              <p className="lede">
                Nearly 400 words in the free library, each with a clear definition and its story. A few of them:
              </p>
            </div>
            <div className="words">
              {WORDS.map((w) => (
                <article className="word-row" key={w.word}>
                  <div>
                    <h3>{w.word}</h3>
                    <div className="word-meta">{w.meta}</div>
                  </div>
                  <div>
                    <p className="word-def">{w.def}</p>
                    <p className="word-origin">{w.origin}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap split">
            <Screen name="gym" alt="A Word Gym round: match each part of the word to its meaning" />
            <div>
              <h2 className="h2">The Word Gym</h2>
              <p className="lede" style={{ marginTop: 20 }}>
                Want more than one question? Take today&rsquo;s word through three short rounds, any time of day.
              </p>
              <ul>
                <li><strong>Roots</strong><span>Match each part of the word to its original meaning.</span></li>
                <li><strong>Meaning</strong><span>Pin down exactly what it says, and what it doesn&rsquo;t.</span></li>
                <li><strong>Usage</strong><span>See how a good writer would use it.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="gold">
          <div className="wrap">
            <div className="gold-panel">
              <div>
                <h2 className="h2">Zazu Gold, <em>coming soon</em></h2>
                <p className="lede" style={{ marginTop: 20 }}>
                  For people who want more. The free app stays free, and complete.
                </p>
                <p style={{ marginTop: 28 }}>
                  <a href="mailto:hello@zazu.org.uk?subject=Zazu%20Gold%20waitlist" className="textlink">
                    Tell me when Gold launches
                  </a>
                </p>
              </div>
              <ul className="gold-list">
                <li>Ten themed packs: law, mythology, music, architecture and more</li>
                <li>1,741 extra words</li>
                <li>Your full word history</li>
                <li>The Word Gym on every word you&rsquo;ve learned</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="wrap">
            <div className="section-head">
              <h2 className="h2">Questions</h2>
            </div>
            <div className="faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="closing dawn">
          <div className="wrap">
            <h2 className="h2">Start tomorrow with a new word.</h2>
            <a href={WAITLIST} className="btn">Join the waitlist</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
