import type { PageKey } from "./routes";

export type Lang = "en" | "es" | "fr";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export interface Teacher {
  slug: string;
  name: string;
  role: string;
  photo: string;
  summary: string;
  bio: string[];
}

export type Dict = {
  /** <title> y <meta description> por página. Lo consume usePageMeta(). */
  meta: Record<PageKey, { title: string; description: string }>;
  nav: { home: string; programs: string; teachers: string; about: string; registration: string; enroll: string; careers: string; contact: string };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stat1: string;
    stat1Label: string;
    stat2: string;
    stat2Label: string;
    stat3: string;
    stat3Label: string;
  };
  testimonials: {
    title: string;
    seeAll: string;
    reviewsSuffix: string;
    translatedNote: string;
    readMore: string;
    readLess: string;
  };
  pedagogy: {
    eyebrow: string;
    title: string;
    body: string;
    pillars: { title: string; body: string }[];
  };
  /**
   * Sólo el titular de la tira de disciplinas de la portada. Las fichas viven en
   * `programs.disciplines`, que es la fuente única: antes había dos juegos con el
   * mismo texto y sólo uno viajaba al JSON-LD.
   */
  instruments: {
    title: string;
    subtitle: string;
    cta: string;
  };
  formats: {
    eyebrow: string;
    title: string;
    subtitle: string;
    photoLabel: string;
    cta: string;
  };
  /** Todo el profesorado vive aquí: la página /teachers y el teaser de la portada. */
  teachers: {
    hero: { eyebrow: string; title: string; subtitle: string };
    title: string;
    subtitle: string;
    verified: string;
    moreLink: string;
    teamTitle: string;
    matchPromise: string;
    bios: { title: string; subtitle: string };
    vetting: { title: string; body: string; cta: string };
    hiring: { title: string; body: string; cta: string };
    director: Teacher;
    team: Teacher[];
  };
  coverage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    citiesTitle: string;
    citiesNote: string;
    schedule: string;
    scheduleBody: string;
    daysOpen: string;
    hoursOpen: string;
    daysClosed: string;
    hoursClosed: string;
    contactsTitle: string;
    mapUnavailable: string;
    mapCta: string;
    cities: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  stepUp: {
    eyebrow: string;
    title: string;
    body: string;
    points: { title: string; body: string }[];
    note: string;
  };
  ctaBanner: {
    title: string;
    body: string;
    button: string;
  };
  widget: {
    title: string;
    body: string;
    placeholder: string;
    loading: string;
    errorTitle: string;
    retry: string;
    directHelp: string;
  };
  notFound: { title: string; body: string; back: string; requested: string; elsewhere: string };
  skipToContent: string;
  programs: {
    hero: { eyebrow: string; title: string; subtitle: string };
    offer: {
      theoryFree: string;
      voiceException: string;
      includesLabel: string;
      methodLabel: string;
      progressLabel: string;
      shortTermLabel: string;
      longTermLabel: string;
    };
    disciplines: {
      key: string;
      name: string;
      tagline: string;
      focus: string;
      method: string;
      progress: { short: string; long: string };
    }[];
    formats: {
      key: string;
      label: string;
      tag: string;
      title: string;
      body: string;
      points: string[];
    }[];
    journey: {
      eyebrow: string;
      title: string;
      subtitle: string;
      steps: { title: string; body: string }[];
    };
  };
  about: {
    hero: { eyebrow: string; title: string; subtitle: string };
    mission: { title: string; blocks: { heading: string; body: string }[] };
    teamLink: { title: string; body: string; cta: string };
    verification: {
      eyebrow: string;
      title: string;
      subtitle: string;
      steps: { title: string; body: string }[];
      compliance: {
        title: string;
        items: { label: string; body: string }[];
      };
    };
  };
  /** Sólo precio: material de evaluación. El cierre vive en `enroll`. */
  registration: {
    hero: { eyebrow: string; title: string; subtitle: string };
    enrollCta: string;
    enrollQualifier: string;
    pricingTitle: string;
    pricingSubtitle: string;
    priceFrom: string;
    priceLabel: string;
    formats: { name: string; description: string; price: string; points: string[] }[];
    lessonLengthTitle: string;
    lessonLength: string;
    benefits: { title: string; subtitle: string; items: { title: string; body: string }[] };
    note: string;
  };
  /** Material de cierre: los pasos, el contrato y el widget de My Music Staff. */
  enroll: {
    hero: { eyebrow: string; title: string; subtitle: string };
    stepsTitle: string;
    stepsSubtitle: string;
    steps: { title: string; body: string }[];
    contract: { title: string; body: string; points: { label: string; body: string }[] };
  };
  contact: {
    hero: { eyebrow: string; title: string; subtitle: string };
    citiesTitle: string;
    citiesBody: string;
    mapTitle: string;
    formTitle: string;
    formSubtitle: string;
    fields: { name: string; student: string; age: string; email: string; phone: string; zip: string;
      instrument: string; channel: string; source: string; availability: string; message: string;
      choose: string; submit: string; terms: string; promo: string };
    channelOptions: string[];
    sourceOptions: string[];
    sending: string;
    errorSend: string;
    successTitle: string;
    successBody: string;
    successAgain: string;
    infoTitle: string;
    infoEmail: string;
    infoPhone: string;
    infoHours: string;
    infoHoursValue: string;
  };
  footer: {
    tagline: string;
    columns: { title: string; links: { label: string; page: PageKey }[] }[];
    contact: string;
    rights: string;
    privacy: string;
    terms: string;
  };
  errors: {
    required: string;
    email: string;
    phone: string;
    zip: string;
  };
  legal: {
    eyebrow: string;
    updated: string;
    footerHeading: string;
    links: { privacy: string; cookies: string; notice: string };
    privacy: { title: string; intro: string; sections: { heading: string; body: string }[] };
    cookies: { title: string; intro: string; sections: { heading: string; body: string }[] };
    notice: { title: string; intro: string; sections: { heading: string; body: string }[] };
  };
  careers: {
    hero: { eyebrow: string; title: string; subtitle: string };
    whyTitle: string;
    whyBody: string;
    perks: { title: string; body: string }[];
    positionsTitle: string;
    positionsEmpty: string;
    positionsEmptyBody: string;
    positions: { title: string; location: string; type: string }[];
    formTitle: string;
    formSubtitle: string;
    fields: { name: string; email: string; phone: string; role: string; link: string; cvHint: string; cvRemove: string; message: string; submit: string; terms: string };
    sending: string;
    errorSend: string;
    fileError: string;
    successTitle: string;
    successBody: string;
    successAgain: string;
  };
};

export const translations: Record<Lang, Dict> = {
  en: {
    meta: {
      home: { title: "In-Home Music Lessons in Miami-Dade & Broward | Alondra", description: "In-home music lessons across Miami-Dade and Broward. We match your child with a carefully selected teacher so they enjoy learning and progress." },
      programs: { title: "Music Lessons in Miami: Piano, Violin, Voice & Guitar", description: "Piano, violin, voice, guitar, flute and bass taught at home in Miami. Every lesson integrates technique, rhythm, music reading and interpretation." },
      teachers: { title: "Meet Our Music Teachers in Miami | Alondra", description: "Ilena Peña and the Alondra teaching team: where each teacher trained, which instruments they teach and how we match them to your child." },
      about: { title: "About Alondra Music Academy | In-Home Lessons Miami", description: "How Alondra teaches: our philosophy, the four dimensions in every lesson, and the vetting, insurance and licensing behind each instructor." },
      registration: { title: "Music Lesson Prices in Miami | Alondra Music Academy", description: "In-home music lessons in Miami-Dade and Broward from $50 per private lesson and $35 shared, with household and frequency discounts." },
      enroll: { title: "Enroll in Music Lessons in Miami | Alondra", description: "How enrollment works at Alondra: the three steps, the monthly agreement, the 24 hour notice rule and the form that reserves your weekly slot." },
      careers: { title: "Music Teacher Jobs in Miami-Dade & Broward | Alondra", description: "Teach piano, voice, guitar or violin with Alondra Music Academy. We look for teachers who combine musical training with a genuine calling to teach." },
      contact: { title: "Contact Alondra Music Academy | Music Lessons in Miami", description: "Ask about availability for your ZIP code and instrument, or book a free 15-minute call. We teach at home across Miami-Dade and Broward, Monday to Saturday." },
      privacy: { title: "Privacy Policy | Alondra Music Academy", description: "How Alondra Music Academy collects, uses and protects your personal information." },
      cookies: { title: "Cookie Policy | Alondra Music Academy", description: "How Alondra Music Academy uses cookies, local storage and analytics on this website." },
      legal: { title: "Legal Notice | Alondra Music Academy", description: "Terms governing the use of the Alondra Music Academy website." },
    },
    nav: { home: "Home", programs: "Formats", teachers: "Teachers", about: "Academy", registration: "Prices", enroll: "Enrollment", careers: "Work with us", contact: "Contact" },
    hero: {
      eyebrow: "Miami-Dade · Broward",
      title1: "Give your child the superpower of music.",
      title2: "Discover their potential today.",
      subtitle:
        "**The right teacher makes the difference.** We match your child with the one who truly connects with them, and lessons they look forward to, at home across Miami-Dade and Broward.",
      ctaPrimary: "Book a free 15-minute call",
      ctaSecondary: "Explore formats",
      stat1: "12+", stat1Label: "Years of experience",
      stat2: "500+", stat2Label: "Students taught by Ilena",
      stat3: "100%", stat3Label: "Verified instructors",
    },
    testimonials: {
      title: "Loved by families across South Florida",
      seeAll: "See all on Google",
      reviewsSuffix: "Google reviews",
      translatedNote: "Translated from the original",
      readMore: "Read the full review",
      readLess: "Show less",
    },
    pedagogy: {
      eyebrow: "Our Method",
      title: "The Alondra Method: four things in every lesson",
      body: "Every Alondra lesson works the same four dimensions, whatever the instrument and whatever the level. It is not a slogan: it is what the teacher plans before arriving and what gets reviewed before leaving. The repertoire changes with each child, and children end up asking for the songs they love, which is exactly as it should be. **What does not change is this.**",
      pillars: [
        { title: "Technique", body: "How the sound is produced: posture, hands, breathing, attack. It is what lets a child play what they can already read, and it gets corrected lesson by lesson, not once at the start." },
        { title: "Rhythm", body: "The pulse underneath everything: subdivision, reading rhythm, playing in time, and holding it when somebody else is playing too." },
        { title: "Music reading", body: "Reading the score: notes, clefs, chord symbols. The goal is for a child to face a new piece on their own, without needing to hear it first." },
        { title: "Interpretation", body: "Giving it meaning: dynamics, phrasing, intention. It is the difference between playing the right notes and making music, and it is what you hear at a recital." },
      ],
    },
    instruments: {
      title: "Disciplines",
      subtitle: "Technique from the conservatory tradition, and the songs your child actually wants to play.",
      cta: "See all seven disciplines",
    },
    formats: {
      eyebrow: "Ways to Learn",
      title: "Formats",
      subtitle: "Choose the format that fits you. Every option keeps the same pedagogical rigor.",
      photoLabel: "Formats photo",
      cta: "See the formats in detail",
    },
    teachers: {
      hero: { eyebrow: "Our Faculty", title: "Meet the teachers", subtitle: "Who will be in your home each week, where they trained, and how Ilena decides which of them fits your child." },
      title: "The teacher who fits your child",
      subtitle: "**Ilena personally selects** the teacher who best connects with each student, from a team of rigorously vetted, **background-checked professionals**.",
      verified: "Verified Instructor",
      moreLink: "Learn about {name}",
      teamTitle: "The team who teaches",
      matchPromise: "If your child does not click with their teacher, tell us and we will look at it and find a better match. Lessons already taught are paid for and there is no refund, but reassigning does not cost a new registration fee.",
      bios: { title: "Meet our team", subtitle: "Every Alondra teacher combines conservatory training with a genuine calling to teach. Get to know their backgrounds." },
      vetting: { title: "Every teacher is vetted before they knock on your door", body: "Background check, psychological evaluation, technical audit and quarterly training. The full process, with the insurance and the licensing behind it, is on the academy page.", cta: "See how we vet" },
      hiring: { title: "Are you a music teacher?", body: "We are always reading applications from teachers who combine conservatory training with a real calling to teach.", cta: "Work with us" },
      director: {
        slug: "profe-ilena",
        name: "Ilena Peña Fernández",
        role: "Founder & Pedagogical Director · Teacher of violin, voice, piano & sound art",
        photo: "/images/profe-ilena.webp",
        summary: "Meet Ilena Peña Fernández, founder and director of Alondra Music Academy, a violinist, sound engineer and educator with **more than 12 years of experience** in music teaching, who also practised as a music therapist earlier in her career, before board certification became a requirement in the United States. Throughout her career she has devoted her life to training and inspiring children, young people and adults, convinced that music is a powerful tool for developing **creativity, discipline, confidence and personal growth**. Her calling for teaching and her commitment to excellence have made her a professional who blends knowledge, sensitivity and passion into every lesson.",
        bio: [
          "Meet Ilena Peña Fernández, founder and director of Alondra Music Academy, a violinist, sound engineer and educator with **more than 12 years of experience** in music teaching, who also practised as a music therapist earlier in her career, before board certification became a requirement in the United States. Throughout her career she has devoted her life to training and inspiring children, young people and adults, convinced that music is a powerful tool for developing **creativity, discipline, confidence and personal growth**. Her calling for teaching and her commitment to excellence have made her a professional who blends knowledge, sensitivity and passion into every lesson.",
          "A graduate of the University of the Arts (ISA) of Cuba with a degree in Music and a specialization in Musical Sound Direction, and trained as a violinist at the prestigious Esteban Salas Conservatory, Ilena has built a distinguished career as a teacher of music, musical theatre and music therapy. In parallel, she has developed a successful career as a sound engineer in renowned recording studios and music productions, working with major artists and high-level projects. This professional experience allows her to offer a **comprehensive education** that combines performance, technique, creativity and a deep understanding of the artistic process.",
          "As the founder of Alondra Music Academy, Ilena has created an academy where **academic excellence and personalized attention** are the foundation of every program. Her methodology adapts to the strengths, needs and goals of each student, fostering dynamic, motivating and meaningful learning. More than teaching an instrument, her purpose is to awaken a love of music, to shape confident and creative musicians, and to give each student the tools they need to **reach their full potential** both on and off the stage. At Alondra she personally teaches violin, voice, piano and sound art.",
        ],
      },
      team: [
        {
          slug: "profe-olivia",
          name: "Olivia García Rey",
          role: "Piano teacher",
          photo: "/images/profe-olivia.webp",
          summary: "A pianist and educator with **more than three decades of experience**, known for her warm, personalized approach to piano pedagogy, who also practised as a music therapist earlier in her career.",
          bio: [
            "Meet Olivia García Rey, a distinguished pianist and educator who earlier in her career also practised as a music therapist, with **more than three decades of experience** training musicians and nurturing the talent of children, young people and adults. Her solid training at prestigious Cuban music institutions, together with an extensive career as a teacher in conservatories and art schools, make her an exceptional master, recognized for her deep knowledge of piano pedagogy, performance and the all-around development of the musician.",
            "Throughout her career, Olivia has guided hundreds of students, helping them develop not only excellent pianistic technique but also **discipline, artistic sensitivity and self-confidence**. Her experience as a music therapist has given her insight into the impact of music on cognitive, emotional and social development, enriching her methodology with a human, close and fully personalized approach, tailored to the strengths, needs and goals of each student.",
            "At Alondra Music Academy, Olivia shares her passion for music with a commitment to inspiring every student to **reach their full potential**. Her lessons offer far more than learning to play the piano: they provide a **high-quality artistic education** that fosters creativity, musical expression, all-around growth and a love of music that lasts a lifetime.",
          ],
        },
        {
          slug: "profe-rafael",
          name: "Rafael Paseiro",
          role: "Guitar & electric bass teacher",
          photo: "/images/profe-rafael.webp",
          summary: "A bassist, composer and arranger with **more than three decades of international experience**; at Alondra he teaches guitar and electric bass.",
          bio: [
            "Rafael Paseiro is a renowned bassist, composer, arranger and guitar teacher with **more than three decades of experience** in music. A **graduate with honors** of the National Art School of Cuba under the tutelage of the prestigious bassist Carlos del Puerto, he has developed an outstanding career that combines performance, composition, musical arrangement and a deep dedication to teaching.",
            "As a performer, composer and arranger, Rafael has contributed to numerous recording productions and shared the stage with prominent artists such as Issac Delgado, Gonzalo Rubalcaba, Harold López-Nussa, Roberto Carcassés, Raúl Paz and The Temptations, among many others. His talent has taken him to some of the world's most important jazz festivals and on tours across the Americas, Europe, Asia and the Caribbean, establishing him as a musician of **recognized international prestige**.",
            "At Alondra Music Academy, Rafael shares his broad experience to train the new generation of musicians through personalized guitar and electric bass lessons. His methodology combines **solid technical training** with the development of creativity, musical expression and confidence in every student, inspiring children, young people and adults to discover and reach their full artistic potential.",
          ],
        },
        {
          slug: "profe-claudia-nuevo",
          name: "Claudia Nuevo",
          role: "Piano & flute teacher",
          photo: "/images/profe-claudia-nuevo.webp",
          summary: "A pianist and flautist trained at the Esteban Salas Conservatory and ISA; she offers **dynamic, personalized lessons** focused on each student.",
          bio: [
            "Meet Claudia Nuevo, a talented pianist, flautist and educator passionate about inspiring her students through music. A graduate of the prestigious Esteban Salas Conservatory and with studies in Music Production and Recording at the University of the Arts (ISA) of Cuba, she combines **solid academic training** with a distinguished career as a performer and teacher.",
            "Throughout her career she has taught piano and flute at renowned music institutions, as well as performing as an accompanying pianist and a member of orchestras, choirs, bands and professional ensembles. Her international experience and her calling for teaching allow her to offer **dynamic, personalized lessons** focused on the **all-around growth of each student**.",
            "At Alondra Music Academy, Claudia creates an environment where technique, creativity and musical expression develop naturally. Her goal is for every student not only to learn to play an instrument, but to **gain confidence**, enjoy learning and discover a passion for music that stays with them for life.",
          ],
        },
        {
          slug: "profe-claudia-rodriguez",
          name: "Claudia D. Rodríguez",
          role: "Euphonium, voice & piano teacher",
          photo: "/images/profe-claudia-rodriguez.webp",
          summary: "A euphonium player, singer and music educator specialized in **euphonium, tuba and chamber music**, with an international performing career.",
          bio: [
            "Meet Claudia D. Rodríguez, a talented euphonium player, singer and music educator passionate about training students with **excellence, creativity and a love of music**. Her solid academic background and broad experience as a teacher and performer allow her to offer dynamic, personalized teaching, inspiring **students of all ages** to develop their full potential.",
            "A graduate of the University of the Arts (ISA) of Cuba with a degree in Music and a **specialization in Euphonium**, and trained at the prestigious Esteban Salas Conservatory, Claudia has taught euphonium, tuba, piano and chamber music at renowned music institutions. She has also built a distinguished career as an instrumentalist and singer, performing in concert bands, professional choirs and international ensembles on stages both in and outside Cuba.",
            "At Alondra Music Academy, Claudia creates a motivating learning environment where **technique, artistic expression and confidence** grow hand in hand. Her commitment is that every student enjoys the process of learning music, strengthens their skills and discovers a passion that will stay with them throughout their life.",
          ],
        },
        {
          slug: "profe-mayda",
          name: "Mayda Placeres",
          role: "Piano teacher",
          photo: "/images/profe-mayda.webp",
          summary: "A pianist and teacher with **more than three decades of experience** in the conservatories of Cuba and Mexico, who now teaches piano to children in Miami.",
          bio: [
            "Mayda Placeres trained at the National School of Music in Havana, where she earned her degree in Music with a **specialization in piano**, and later completed a postgraduate programme in Musical Heritage and Historiography at the Universidad San Gerónimo de La Habana. Her teaching career began at that same school, where she taught piano for **two decades**.",
            "She went on to teach at the National Conservatory of Music of Mexico, in Mexico City, before settling in South Florida, where she has been teaching piano to children since 2022. Across thirty years and three countries, her work has combined an **advanced command of classical piano** with a deep knowledge of music theory and a steady focus on what actually works in a lesson: clear technique, effective teaching methods and a close relationship with each student.",
            "At Alondra Music Academy, Mayda teaches piano to children and young people. Her lessons build **solid technical foundations** without losing the motivation that keeps a child coming back to the instrument. That balance is what she refined over a career spent in conservatories and, above all, in front of students.",
          ],
        },
      ],
    },
    coverage: {
      eyebrow: "Service Area",
      title: "Serving Miami-Dade & Broward",
      subtitle: "We bring lessons **directly to your home** across South Florida.",
      citiesTitle: "Cities",
      citiesNote: "Don't see your city? We're open to other areas. Contact us to arrange **custom in-home lessons**.",
      schedule: "Hours",
      scheduleBody: "In-home lessons across the greater Miami area, on a **schedule that fits your life**.",
      daysOpen: "Monday – Saturday",
      hoursOpen: "8:00 AM – 8:00 PM",
      daysClosed: "Sunday",
      hoursClosed: "Closed",
      contactsTitle: "Contacts",
      mapUnavailable: "The map couldn't load right now.",
      mapCta: "Open in Google Maps",
      cities: ["Coral Gables", "Doral", "Flagami", "Westchester", "Sweetwater", "South Miami", "Dadeland", "Kendall", "Hialeah", "Miami Springs", "Miami Lakes"],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequent questions",
      items: [
        { q: "At what age can lessons start?", a: "We welcome students from 0 years old through our **early stimulation program**, with formal instrumental study typically beginning at age 4, and there's no upper age limit, adult beginners included." },
        { q: "Do you teach adult students?", a: "Yes. Children are our primary focus, but we teach **students of all ages**. There's no age limit to start. We tailor the repertoire and pace to each student." },
        { q: "Do you truly come to our home?", a: "Yes, all lessons are **delivered at your home** across Miami-Dade and Broward counties." },
        { q: "How are your instructors verified?", a: "Every instructor passes a **strict state and national background check**, a psychological aptitude evaluation and a musical technical audit. We make sure only verified, talented professionals with deep human sensitivity **enter the comfort of your home**." },
        { q: "What instrument should my child start with?", a: "The ideal instrument is chosen by balancing your child's age (motor maturity) with their own preferences and interests. To make sure they start off on the right foot, we offer a **free discovery call** where we assess their profile and schedule their class with the right specialist, ensuring a motivating, personalized start from day one." },
        { q: "How long is a typical lesson?", a: "The standard format for most instruments and the **early stimulation program** is 45 minutes, extending to 60 minutes for advanced levels. 30-minute sessions are available only when more than two students enroll in the same household, optimizing family logistics." },
        { q: "Do you provide the instrument?", a: "At the start, yes: if you need a few days to get your own, we bring the instrument to the lesson so your child doesn't lose time. But it is a temporary arrangement, and we do recommend buying one: **your child needs an instrument at home to practise during the week**, and that practice between lessons is where the progress actually happens. We'll give you **expert buying and setup guidance** so you choose the right one, easily and safely." },
        { q: "Can siblings share a lesson slot?", a: "Yes, we offer **sibling discounts** and split-lesson formats when age-appropriate." },
        { q: "What if we need to reschedule?", a: "If you let us know **more than 24 hours in advance**, the class is rescheduled with no problem. For last-minute cancellations, the session is considered delivered, except in cases of demonstrable emergencies or medical issues. In addition, if there are frequent absences within the same month, 50% of the classes will be made up to protect your child's continuity." },
        { q: "Are there recitals or performances?", a: "Yes. **Seasonal recitals** are part of the academy's program: they are the occasion for each student to share their progress with family and community. Dates are announced to enrolled families in advance." },
        { q: "How do I enroll?", a: "It's very simple! Just click our Contact Us button to message us on WhatsApp, or fill out the form on the site. Within 48 hours we'll set up your **free discovery phone call** to get to know your child and match them with the ideal specialist teacher." },
      ],
    },
    stepUp: {
      eyebrow: "Step Up For Students",
      title: "If your family has Step Up funds, you can use them here",
      body: "We are a **direct provider**, so the lessons are paid from the scholarship without you having to front the money and claim it back. It is not the only thing that makes it workable, though: the paperwork is where most families get stuck.",
      points: [
        { title: "Direct provider", body: "The funds go to the academy. No advancing money, no waiting for a refund." },
        { title: "We help with the paperwork", body: "The part that takes an afternoon the first time. We have done it before and we walk you through it." },
        { title: "In English, Spanish or French", body: "Including the paperwork. If the forms are not in your language, that is where families give up." },
        { title: "At home, like every lesson", body: "Using the scholarship changes nothing about how the class works." },
      ],
      note: "We do not decide who qualifies: that is Step Up's call, and their requirements change. What we do is make the funds simple to use once you have them.",
    },
    ctaBanner: {
      title: "Ready to begin your musical journey?",
      body: "Book a **free discovery call** and we'll match your child with the ideal instructor.",
      button: "Book a free 15-minute call",
    },
    widget: {
      title: "Complete your enrollment",
      body: "Already had your discovery call? Confirm your weekly schedule here. Powered by My Music Staff.",
      placeholder: "My Music Staff registration widget will be embedded here.",
      loading: "Loading the scheduler…",
      errorTitle: "The scheduler didn't load",
      retry: "Try again",
      directHelp: "Prefer to book directly? Message us on WhatsApp or by email and we'll set it up for you.",
    },
    notFound: { title: "Page not found", body: "This link is broken or the page has moved. Nothing is wrong with your browser.", back: "Back home", requested: "You asked for", elsewhere: "Or go straight to" },
    skipToContent: "Skip to content",
    programs: {
      hero: {
        eyebrow: "Formats and instruments",
        title: "A path for every musician",
        subtitle: "Seven disciplines, taught in three formats, each path shaped around your child. Click a discipline to see the method and how progress shows up.",
      },
      offer: {
        theoryFree: "Music theory is included free with every discipline.",
        voiceException: "Voice is the one exception: theory lessons are billed separately.",
        includesLabel: "Included disciplines",
        methodLabel: "The Method",
        progressLabel: "The Progress",
        shortTermLabel: "Short term (1–3 months)",
        longTermLabel: "Long term",
      },
      disciplines: [
        {
          key: "piano",
          name: "Piano",
          tagline: "Two hands, two clefs, and the whole harmony under the fingers.",
          focus: "Independence of each hand, reading treble and bass clef at once, and an even touch across the keyboard.",
          method: "We combine the technical precision of the classical school with an agile, adapted reading approach. From the very first lessons, the child works on the **independence of both hands** and reading treble and bass clef simultaneously.",
          progress: { short: "Correct posture at the keyboard, recognition of musical notes and playing their first fluent two-handed melodies.", long: "Sight-reading a piece they have never heard, and a repertoire they can play from beginning to end for someone else." },
        },
        {
          key: "violin",
          name: "Violin",
          tagline: "Intonation built by ear and by arm.",
          focus: "Bow hold and left-hand position, tuning with no frets to guide you, and bow control for a steady sound.",
          method: "Based on **postural discipline and ear training**. We implement a progressive system that prioritizes precise tuning and bow placement before advancing to complex techniques, keeping motivation high.",
          progress: { short: "Bow control, relaxed body posture, stability in holding the instrument and producing a clean tone.", long: "Clean intonation in the positions studied, a sustained sound, and the ability to tune their own instrument." },
        },
        {
          key: "flute",
          name: "Flute",
          tagline: "Air turned into sound.",
          focus: "Embouchure, breath support, clean articulation and phrasing a line without running out of air.",
          method: "Focused on air control and elegant phrasing. The program joins traditional embouchure technique with strict rhythmic reading, so that **breath control** carries the phrase all the way to the end.",
          progress: { short: "Producing a clear, sustained sound, correct hand position and playing initial scales and melodies.", long: "A steady sound across the registers studied, controlled articulation, and phrases carried to the end." },
        },
        {
          key: "guitar",
          name: "Guitar",
          tagline: "Chords, melody and accompaniment on the same six strings.",
          focus: "Reading both score and tablature, clean chord changes, and right-hand patterns for accompanying.",
          method: "A versatile path spanning classical, acoustic and contemporary guitar. The student learns to read **scores and tablature** in parallel, combining solo melodies with accompanying rhythm.",
          progress: { short: "Initial finger strength and agility, clean transitions between basic chords and playing simple rhythms.", long: "Accompanying a song from beginning to end, playing a melody with their own fingering, and reading a new chart." },
        },
        {
          key: "bass",
          name: "Electric Bass",
          tagline: "The instrument that holds a band together.",
          focus: "Fingering in both hands, playing to a metronome, and reading bass lines and chord symbols.",
          method: "Designed to explore the bass as an individual instrument of great melodic character, without neglecting its role as the **rhythmic heart of an ensemble**. It focuses on applied harmonic theory, tempo and a sense of groove.",
          progress: { short: "Perfect rhythmic synchronization, fingering technique in both hands and playing fundamental bass lines.", long: "Holding the tempo without a metronome, building a line over a chart, and locking in with a drummer." },
        },
        {
          key: "voice",
          name: "Voice",
          tagline: "The instrument you carry with you.",
          focus: "Diaphragmatic breathing, healthy emission for a child’s anatomy, diction and tuning.",
          method: "A healthy vocal training approach designed specifically for children's anatomy. We integrate playful exercises in **diaphragmatic breathing**, diction and resonance, always caring for their vocal health.",
          progress: { short: "Basic tuning, conscious **breath control** and overcoming initial stage fright.", long: "A comfortable range used without strain, clear diction, and a song prepared well enough to sing in front of people." },
        },
        {
          key: "soundArt",
          name: "The Art of Sound",
          tagline: "Making music with a computer.",
          focus: "Recording, editing and the basics of mixing, plus the theory needed to arrange what you write.",
          method: "A creative, interactive lab. We fuse the fundamentals of music theory and basic acoustics with the use of **digital production software**. The student learns to structure their own musical ideas and understand how sound travels and transforms.",
          progress: { short: "Understanding the digital environment, creating their first rhythmic sequences and recognizing basic frequencies and sound textures.", long: "A finished piece recorded, arranged and mixed by the student from start to finish." },
        },
      ],
      formats: [
        {
          key: "individual",
          label: "Individual",
          tag: "All disciplines",
          title: "Individual lessons",
          body: "**One-on-one instruction** built entirely around a single student: pace, repertoire and goals shaped lesson by lesson. Available for every discipline we teach, with music theory woven in at no extra cost.",
          points: [
            "A dedicated instructor for one student.",
            "Fully personalized curriculum and repertoire.",
            "Music theory included free, billed separately for Voice.",
          ],
        },
        {
          key: "pianoLab",
          label: "Piano Lab",
          tag: "Piano · Small group",
          title: "Piano Lab",
          body: "Several students learn piano in the same room at once, each at their own premium digital keyboard, on headphones. The teacher rotates from station to station, giving every student **dedicated one-on-one time** to refine technique and set new milestones. No one is ever held back or rushed by the group.",
          points: [
            "Each student at their own premium digital keyboard, with headphones.",
            "The teacher rotates for **dedicated one-on-one time** at every station.",
            "Private-lesson progress within an inspiring, social setting.",
          ],
        },
        {
          key: "littleMozart",
          label: "Little Mozart",
          tag: "Ages 0–4",
          title: "Little Mozart",
          body: "A special early-childhood program designed personally by our founder, Ilena Peña Fernández. Drawing on the **Orff, Kodály and Suzuki methods**, it awakens musicality in the very youngest children, from birth to age four, through rhythmic and vocal exploration, movement and play.",
          points: [
            "Designed personally by founder Ilena Peña Fernández.",
            "Built on the **Orff, Kodály and Suzuki methods**, for ages 0 to 4.",
            "Rhythm, singing and a first hands-on taste of piano, violin and guitar.",
          ],
        },
      ],
      journey: {
        eyebrow: "Your journey through our academy",
        title: "From first note to full mastery",
        subtitle: "A clear, structured path. Every stage is described by **what the student can do**, not by what we promise them.",
        steps: [
          { title: "Connection", body: "A first phone call to understand the child’s age, interests and schedule before assigning an instrument and a teacher." },
          { title: "Initiation", body: "Posture, the first notes and reading the staff: the child plays short pieces from the score instead of by imitation." },
          { title: "Evolution", body: "Longer pieces, a steadier tempo and the first dynamics. The student starts preparing a piece to play for somebody else." },
          { title: "Autonomy", body: "Reading a new score without help, keeping a repertoire ready, and starting to improvise over what they already know." },
          { title: "Mastery", body: "A repertoire played from beginning to end, sight-reading, and the preparation an audition or a certification requires." },
        ],
      },
    },
    about: {
      hero: {
        eyebrow: "About Us",
        title: "A musical education designed to transcend",
        subtitle: "We build an education standard of international level **in the comfort of your home**. We're devoted to cultivating young **students' artistic potential** within a rigorous ethical framework, combining world-class methodologies with warm, close and transparent guidance.",
      },
      mission: {
        title: "Our philosophy",
        blocks: [
          { heading: "Connecting pedagogical science with artistic sensitivity", body: "Every lesson integrates **technique, rhythm, music reading and interpretation**, adapted to how each student learns." },
          { heading: "Pedagogical excellence guided by our founder", body: "Alondra Music Academy is led personally by its **founding director**. Every session is delivered exclusively by professionals of the classical high school, rigorously trained and with **fully verified backgrounds** for your **complete peace of mind**." },
        ],
      },
      teamLink: {
        title: "Meet the teachers",
        body: "Ilena personally selects the teacher who best connects with each student. Their training, their instruments and their full biographies have a page of their own.",
        cta: "Meet our teachers",
      },
      verification: {
        eyebrow: "Safety First",
        title: "How we vet every instructor",
        subtitle: "Because trust is not optional when it comes to your children.",
        steps: [
          { title: "Background Check", body: "Thorough **criminal-record and federal-registry screening** through certified U.S. providers." },
          { title: "Psychological Evaluation", body: "Structured interviews examining **emotional intelligence, empathy** and teaching communication with minors." },
          { title: "Technical Certification", body: "Aptitude auditions and **live teaching demonstrations**, strictly assessed by our academic direction." },
          { title: "Ongoing Training", body: "Mandatory quarterly training in child development, teaching practice and advanced **child-protection protocols**." },
        ],
        compliance: {
          title: "Fully compliant, fully insured",
          items: [
            { label: "FDLE Level 2 cleared", body: "Every instructor has passed fingerprinting and **Level 2 screening** through Florida's Department of Law Enforcement." },
            { label: "$1M liability insurance", body: "A **$1,000,000 general liability policy** (CPH Insurance) stands behind every lesson we teach." },
            { label: "Registered Florida LLC", body: "Alondra is a **fully registered and active Limited Liability Company** in the State of Florida." },
          ],
        },
      },
    },
    registration: {
      hero: { eyebrow: "Pricing", title: "What a lesson costs", subtitle: "Two formats, both taught at your home across Miami-Dade and Broward. Household and frequency discounts apply from the second member." },
      enrollCta: "Register now",
      enrollQualifier: "Already had your discovery call?",
      pricingTitle: "Transparent rates, no surprises",
      pricingSubtitle: "**No forced contracts or hidden fees**. Choose the format that fits your child's goals and learning pace.",
      priceFrom: "from",
      priceLabel: "/ lesson",
      formats: [
        { name: "Private lesson", description: "Individualized, **fully personalized focus** based on the student's specific goals.", price: "$50", points: ["A 100% dedicated instructor", "Curriculum at your own pace"] },
        { name: "Shared lesson", description: "High-caliber format taught in **small groups of 3 to 6 students**.", price: "$35", points: ["Socializing and mutual motivation", "Individualized technical instruction"] },
      ],
      lessonLengthTitle: "How long is a lesson",
      lessonLength: "45 minutes is the standard for most instruments and for the **early stimulation program**, and 60 minutes for advanced levels. 30 minute sessions only when more than two students enroll in the same household.",
      benefits: {
        title: "More music, greater savings",
        subtitle: "We reward your household's consistency with **competitive advantages** applied automatically to your monthly Stripe billing:",
        items: [
          { title: "Multi-family discount", body: "Get a special **10% discount** on your monthly membership from the second household member enrolled." },
          { title: "Frequency discount", body: "Receive a **preferential per-lesson rate** when you schedule two or more weekly classes per student." },
        ],
      },
      note: "Final pricing is confirmed when you get in touch, based on **lesson length and frequency**.",
    },
    enroll: {
      hero: { eyebrow: "Enroll", title: "Registration & enrollment", subtitle: "Everything you need to join Alondra: the three steps, our simple agreement and the form that **reserves your weekly slot**." },
      stepsTitle: "The simplest path to get started",
      stepsSubtitle: "We designed an **agile, transparent process** so your family can begin their musical journey with no hassle and **complete peace of mind**.",
      steps: [
        { title: "Get in touch", body: "Message us on WhatsApp or fill out our online form. We assess your child's profile and match the ideal instructor **within 48 hours**." },
        { title: "Sign the agreement", body: "Receive our transparent study-policy agreement digitally, designed to set clear expectations and **protect your family**." },
        { title: "Reserve your spot", body: "Confirm your recurring weekly schedule and you're set! High-caliber lessons begin right in the **comfort and safety of your own home**." },
      ],
      contract: {
        title: "Full transparency, no long-term contracts",
        body: "Our agreement is designed under U.S. standards to give you **total clarity and peace of mind** from day one:",
        points: [
          { label: "Fixed monthly membership", body: "**Automated payments via Stripe** (Auto-Pay) on the 1st of each month." },
          { label: "Mandatory 24h notice", body: "**Flexible rescheduling** by giving notice of absences 24 hours in advance." },
          { label: "Flexible 15-day cancellation", body: "**Cancel or pause your service** by giving 15 days' notice before the next month begins." },
          { label: "Safe home environment", body: "We require **an adult to be physically present** at home throughout the lesson." },
        ],
      },
    },
    contact: {
      hero: { eyebrow: "Contact & Coverage", title: "We come to your home", subtitle: "Serving students across Miami-Dade and Broward with **warmth and precision**." },
      citiesTitle: "Cities we proudly serve",
      citiesBody: "From Coral Gables and Doral to Kendall, Hialeah and beyond, Alondra Music Academy brings **premium private lessons** **directly to your home** across the greater Miami area. Don't see your city? Contact us for custom arrangements.",
      mapTitle: "Coverage map",
      formTitle: "Get in touch",
      formSubtitle: "Tell us who the lessons are for. We reply within 24 hours.",
      fields: {
        name: "Full name", student: "Student's name or initial", age: "Student's age",
        email: "Email", phone: "Phone", zip: "ZIP code",
        instrument: "Instrument of interest", channel: "How should we reply?",
        source: "How did you hear about Alondra?", availability: "Rough availability",
        message: "Anything else we should know?",
        choose: "Select an option",
        submit: "Send message",
        terms: "I accept the terms and conditions for the processing of my personal data.",
        promo: "I would also like to receive news from the academy by email. (Optional)",
      },
      channelOptions: ["WhatsApp", "Phone call", "Email"],
      sourceOptions: ["Nextdoor", "Google search", "Instagram or Facebook", "A family recommended you", "Somewhere else"],
      sending: "Sending…",
      errorSend: "We couldn't send your message. Please try again or email us at alondramusicacademy@gmail.com.",
      successTitle: "Thank you!",
      successBody: "We've received your message and will reply within 24 hours.",
      successAgain: "Send another message",
      infoTitle: "Direct contact",
      infoEmail: "alondramusicacademy@gmail.com",
      infoPhone: "+1 (786) 843-1028",
      infoHours: "Client Care Hours",
      infoHoursValue: "Mon–Sat · 8 AM – 8 PM · Sun closed",
    },
    footer: {
      tagline: "**Connection that inspires. Progress you can hear.** In-home music lessons across Miami-Dade and Broward.",
      columns: [
        { title: "Academy", links: [{ label: "Home", page: "home" }, { label: "Formats", page: "programs" }, { label: "Teachers", page: "teachers" }, { label: "Academy", page: "about" }] },
        { title: "Enroll", links: [{ label: "Prices", page: "registration" }, { label: "Enrollment", page: "enroll" }, { label: "Contact", page: "contact" }, { label: "Work with us", page: "careers" }] },
      ],
      contact: "Contact",
      rights: "All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
    },
    errors: { required: "This field is required", email: "Please enter a valid email", phone: "Please enter a valid phone", zip: "Enter a 5-digit ZIP code" },
    legal: {
      eyebrow: "Legal",
      updated: "Last updated: July 20, 2026",
      footerHeading: "Legality",
      links: { privacy: "Privacy Policy", cookies: "Cookie Policy", notice: "Legal Notice" },
      privacy: {
        title: "Privacy Policy",
        intro:
          "This Privacy Policy explains how Alondra Music Academy (“Alondra”, “we”, “us”) collects, uses, and protects the personal information of families and visitors. Alondra operates from Florida, in the United States, and this policy is drafted under U.S. law.",
        sections: [
          { heading: "Information we collect", body: "We collect the information you choose to give us: through our contact form (your name, email, phone number, city, and message); through our job application form (your name, email, phone number, the position you apply for, your message, and any résumé/CV you attach); and the student details a parent or guardian provides when enrolling. We also receive basic technical data (such as device, browser, and IP address) collected automatically as you use the site, both by embedded third-party services and by Google Analytics, which we use to measure site usage in aggregate." },
          { heading: "How we use your information", body: "We use your information to respond to inquiries, schedule and deliver lessons, process enrollment, review job applications, and communicate with you. We do not sell your personal information, and we do not share it for cross-context behavioral advertising." },
          { heading: "Service providers and third parties", body: "We share information only with the providers that help us operate the academy: My Music Staff (our embedded scheduling and registration tool); Google (Gmail processes and delivers the messages you send through our forms, and Google Maps powers our coverage map); and WhatsApp/Meta, if you choose to contact us through WhatsApp. Each has its own privacy policy. Résumés you submit are sent to us by email and are not stored on our own server. We may also disclose information where required by law." },
          { heading: "Children's privacy", body: "This site is directed to parents and guardians, not to children. We do not knowingly collect personal information directly from children under 13; any information about a student is provided by a parent or guardian, who consents on the child's behalf. If you believe a child has given us personal information, contact us and we will delete it." },
          { heading: "Your privacy rights", body: "Depending on where you live, you may have the right to access, correct, delete, or obtain a copy of your personal information, and to opt out of the sale of your data or of targeted advertising (neither of which we do). Florida residents have these rights under the Florida Digital Bill of Rights, and California residents under the CCPA/CPRA; residents of other states may have similar rights. We will not discriminate against you for exercising them. To make a request, email us at the address below." },
          { heading: "Data retention and security", body: "We keep personal information only as long as needed for the purposes described here (form submissions reach us as email handled through Gmail) and we apply reasonable safeguards to protect it. No method of transmission over the internet is fully secure." },
          { heading: "Contact", body: "Questions about this policy? Email us at alondramusicacademy@gmail.com or call +1 (786) 843-1028." },
        ],
      },
      cookies: {
        title: "Cookie Policy",
        intro:
          "This Cookie Policy describes how Alondra Music Academy uses cookies and similar technologies on our website. Alondra operates from Florida, in the United States.",
        sections: [
          { heading: "What are cookies and similar technologies", body: "Cookies are small text files stored on your device that help websites function and remember preferences. We also use your browser's local storage for the same purpose, for example, to remember your selected language or theme." },
          { heading: "How we use them", body: "We use functional storage and analytics. We save your language choice and your dark/light theme preference locally in your browser (local storage) so the site works the way you left it. We also use Google Analytics, which sets cookies to measure how the site is used. We do not use advertising cookies and we do not use these cookies to identify you personally." },
          { heading: "Third-party cookies", body: "Some features rely on embedded third-party services (our My Music Staff scheduler and the Google Maps coverage map) which may set their own cookies, subject to their respective privacy policies. Google Analytics also sets its own cookies, governed by Google's privacy policy. You can opt out of Google Analytics across every site using Google's browser add-on." },
          { heading: "Managing cookies and local storage", body: "You can control or delete cookies and local storage through your browser settings. Clearing them may reset your saved preferences, such as your language or theme." },
          { heading: "Contact", body: "Questions about our use of cookies? Email us at alondramusicacademy@gmail.com." },
        ],
      },
      notice: {
        title: "Legal Notice",
        intro:
          "This Legal Notice sets out the terms governing your use of the Alondra Music Academy website. Alondra operates from Florida, in the United States.",
        sections: [
          { heading: "Website operator", body: "This website is operated by Alondra Music Academy, based in Florida, United States. Contact: alondramusicacademy@gmail.com · +1 (786) 843-1028." },
          { heading: "Use of the site", body: "The content on this site is provided for general information about our music lessons and services. You agree to use the site lawfully and not to misuse or disrupt it." },
          { heading: "Intellectual property", body: "All content on this site (text, graphics, logos, and images) is the property of Alondra Music Academy or its licensors and may not be reproduced without permission." },
          { heading: "Disclaimer and liability", body: "We strive to keep information accurate and up to date but make no warranties as to its completeness. To the fullest extent permitted by law, Alondra is not liable for any damages arising from use of this site." },
          { heading: "Governing law", body: "This notice is governed by the laws of the State of Florida and applicable U.S. federal law, without regard to conflict-of-law principles." },
        ],
      },
    },
    careers: {
      hero: {
        eyebrow: "Careers",
        title: "Work with us",
        subtitle: "Help students of every age discover the joy of music. If you're a **passionate, rigorously trained musician-educator**, we'd love to meet you.",
      },
      whyTitle: "Why work with Alondra",
      whyBody: "At Alondra we're building a faculty of **exceptional musician-educators** who care as much about their students as they do about music. We invest in our teachers, protect their time, and give them the support to do their best work, in a warm, professional and growing academy.",
      perks: [
        { title: "A caring culture", body: "A supportive, family-first team that values **warmth, patience and craft**." },
        { title: "Fair, flexible work", body: "Schedules that respect your life, **competitive pay**, and lessons close to home." },
        { title: "Real growth", body: "**Ongoing training, mentorship** and a clear path to grow with the academy." },
        { title: "Trust & safety", body: "A rigorously vetted team where **professionalism and child safety** come first." },
      ],
      positionsTitle: "Open positions",
      positionsEmpty: "No open positions right now",
      positionsEmptyBody: "We're not actively hiring at the moment, but we're always glad to hear from great people. Send us a spontaneous application below and we'll reach out when the right role opens up.",
      positions: [],
      formTitle: "Spontaneous application",
      formSubtitle: "Tell us about yourself and we'll keep you in mind for future openings.",
      fields: {
        name: "Full name",
        email: "Email",
        phone: "Phone",
        role: "Instrument / role of interest",
        link: "CV or portfolio (optional)",
        cvHint: "Drag your CV here or click to browse",
        cvRemove: "Remove file",
        message: "About you",
        submit: "Send application",
        terms: "I accept the terms and conditions for the processing of my personal data.",
      },
      sending: "Sending…",
      errorSend: "We couldn't send your application. Please try again or email us at alondramusicacademy@gmail.com.",
      fileError: "The file must be a PDF or Word document under 5 MB.",
      successTitle: "Application received!",
      successBody: "Thank you for your interest in Alondra. We'll be in touch if a matching role opens up.",
      successAgain: "Send another application",
    },
  },
  es: {
    meta: {
      home: { title: "Clases de Música a Domicilio en Miami | Alondra", description: "Clases de música a domicilio en Miami-Dade y Broward. Elegimos al profesor adecuado para que tu hijo disfrute aprendiendo y progrese." },
      programs: { title: "Clases de Música en Miami: Piano, Violín, Canto y Guitarra", description: "Piano, violín, canto, guitarra, flauta y bajo a domicilio en Miami. Cada clase integra técnica, ritmo, lectura e interpretación." },
      teachers: { title: "Conoce a Nuestros Profesores de Música en Miami", description: "Ilena Peña y el equipo de Alondra: dónde se formó cada profesor, qué instrumentos enseña y cómo lo elegimos para cada alumno." },
      about: { title: "Sobre Alondra Music Academy | Clases a Domicilio Miami", description: "Cómo enseña Alondra: nuestra filosofía, las cuatro dimensiones de cada clase y la verificación, el seguro y el registro detrás de cada profesor." },
      registration: { title: "Precios de Clases de Música en Miami | Alondra", description: "Clases de música a domicilio en Miami-Dade y Broward desde $50 la clase privada y $35 la compartida, con descuentos por hogar y frecuencia." },
      enroll: { title: "Inscripción en Clases de Música en Miami | Alondra", description: "Cómo es la inscripción en Alondra: los tres pasos, el acuerdo mensual, el aviso de 24 horas y el formulario que reserva tu horario semanal." },
      careers: { title: "Empleo para Profesores de Música en Miami | Alondra", description: "Enseña piano, canto, guitarra o violín con Alondra Music Academy. Buscamos profesores que combinen formación musical con paciencia y vocación por enseñar." },
      contact: { title: "Contacta con Alondra Music Academy | Clases en Miami", description: "Consulta disponibilidad para tu código postal e instrumento o agenda una llamada gratuita de 15 minutos. A domicilio en Miami-Dade y Broward." },
      privacy: { title: "Política de Privacidad | Alondra Music Academy", description: "Cómo Alondra Music Academy recopila, usa y protege tu información personal." },
      cookies: { title: "Política de Cookies | Alondra Music Academy", description: "Cómo Alondra Music Academy usa cookies, almacenamiento local y analítica en este sitio web." },
      legal: { title: "Notas Legales | Alondra Music Academy", description: "Términos que rigen el uso del sitio web de Alondra Music Academy." },
    },
    nav: { home: "Inicio", programs: "Formatos", teachers: "Profesores", about: "Academia", registration: "Precios", enroll: "Inscripción", careers: "Trabaja con nosotros", contact: "Contacto" },
    hero: {
      eyebrow: "Miami-Dade · Broward",
      title1: "Dale a tu hijo el superpoder de la música.",
      title2: "Descubre su potencial hoy mismo.",
      subtitle:
        "**El profesor adecuado hace la diferencia.** Elegimos para tu hijo el que mejor conecta con él, y clases a las que le apetece volver, en casa y en todo Miami-Dade y Broward.",
      ctaPrimary: "Agenda tu llamada gratuita de 15 min",
      ctaSecondary: "Ver los formatos",
      stat1: "12+", stat1Label: "Años de experiencia",
      stat2: "500+", stat2Label: "Estudiantes formados por Ilena",
      stat3: "100%", stat3Label: "Profesores verificados",
    },
    testimonials: {
      title: "Amados por familias en todo el sur de Florida",
      seeAll: "Ver todas en Google",
      reviewsSuffix: "reseñas de Google",
      translatedNote: "Traducida del idioma original",
      readMore: "Leer la reseña completa",
      readLess: "Mostrar menos",
    },
    pedagogy: {
      eyebrow: "Nuestro Método",
      title: "El Método Alondra: cuatro cosas en cada clase",
      body: "Cada clase de Alondra trabaja las mismas cuatro dimensiones, sea cual sea el instrumento y sea cual sea el nivel. No es un lema: es lo que el profesor planifica antes de llegar y lo que repasa antes de irse. El repertorio cambia con cada niño, y los niños acaban pidiendo las canciones que les gustan, que es como debe ser. **Lo que no cambia es esto.**",
      pillars: [
        { title: "Técnica", body: "Cómo se produce el sonido: postura, manos, respiración, ataque. Es lo que permite tocar lo que ya se sabe leer, y se corrige clase a clase, no una sola vez al principio." },
        { title: "Ritmo", body: "El pulso que va por debajo de todo: subdivisión, lectura rítmica, tocar a tiempo, y sostenerlo cuando hay alguien más tocando." },
        { title: "Lectura musical", body: "Leer la partitura: notas, claves, cifrado. El objetivo es que el niño se enfrente solo a una pieza nueva, sin necesidad de escucharla antes." },
        { title: "Interpretación", body: "Darle sentido: dinámica, fraseo, intención. Es la diferencia entre tocar las notas correctas y hacer música, y es lo que se escucha en un recital." },
      ],
    },
    instruments: {
      title: "Disciplinas",
      subtitle: "La técnica de la tradición del conservatorio y las canciones que tu hijo de verdad quiere tocar.",
      cta: "Ver las siete disciplinas",
    },
    formats: {
      eyebrow: "Formas de aprender",
      title: "Formatos",
      subtitle: "Elige el formato que mejor se adapte a ti. Todas las opciones mantienen el mismo rigor pedagógico.",
      photoLabel: "Foto de formatos",
      cta: "Ver los formatos en detalle",
    },
    teachers: {
      hero: { eyebrow: "Nuestros profesores", title: "Conoce a quien enseñará a tu hijo", subtitle: "Quién entra en tu casa cada semana, dónde se formó y cómo elige Ilena al que mejor encaja con tu hijo." },
      title: "El profesor que encaja con tu hijo",
      subtitle: "**Ilena elige personalmente** al profesor que mejor conecta con cada estudiante, de un equipo de profesionales con **antecedentes comprobados**.",
      verified: "Instructor Verificado",
      moreLink: "Conoce a {name}",
      teamTitle: "El equipo que enseña",
      matchPromise: "Si tu hijo no conecta con su profesor, dínoslo: revisamos la situación y buscamos una mejor combinación. Las clases ya impartidas se pagan y no hay devolución, pero la reasignación no cobra matrícula nueva.",
      bios: { title: "Conoce a nuestro equipo", subtitle: "Cada profesor de Alondra combina una formación de conservatorio con una vocación genuina por enseñar. Conoce sus trayectorias." },
      vetting: { title: "Cada profesor pasa el filtro antes de llamar a tu puerta", body: "Verificación de antecedentes, evaluación psicológica, auditoría técnica y formación trimestral. El proceso completo, con el seguro y el registro que lo respaldan, está en la página de la academia.", cta: "Ver cómo verificamos" },
      hiring: { title: "¿Eres profesor de música?", body: "Leemos siempre las candidaturas de profesores que combinan formación de conservatorio con una vocación real por enseñar.", cta: "Trabaja con nosotros" },
      director: {
        slug: "profe-ilena",
        name: "Ilena Peña Fernández",
        role: "Fundadora y Directora Pedagógica · Profesora de violín, canto, piano y arte del sonido",
        photo: "/images/profe-ilena.webp",
        summary: "Conoce a Ilena Peña Fernández, fundadora y directora de Alondra Music Academy, violinista, ingeniera de sonido y educadora con **más de 12 años de experiencia** en la enseñanza musical, que además ejerció como musicoterapeuta en una etapa anterior de su carrera, antes de que la certificación de junta fuera un requisito en Estados Unidos. A lo largo de su carrera ha dedicado su vida a formar e inspirar a niños, jóvenes y adultos, convencida de que la música es una poderosa herramienta para desarrollar **la creatividad, la disciplina, la confianza y el crecimiento personal**. Su vocación por la enseñanza y su compromiso con la excelencia la han convertido en una profesional que combina conocimiento, sensibilidad y pasión en cada clase.",
        bio: [
          "Conoce a Ilena Peña Fernández, fundadora y directora de Alondra Music Academy, violinista, ingeniera de sonido y educadora con **más de 12 años de experiencia** en la enseñanza musical, que además ejerció como musicoterapeuta en una etapa anterior de su carrera, antes de que la certificación de junta fuera un requisito en Estados Unidos. A lo largo de su carrera ha dedicado su vida a formar e inspirar a niños, jóvenes y adultos, convencida de que la música es una poderosa herramienta para desarrollar **la creatividad, la disciplina, la confianza y el crecimiento personal**. Su vocación por la enseñanza y su compromiso con la excelencia la han convertido en una profesional que combina conocimiento, sensibilidad y pasión en cada clase.",
          "Graduada de la Universidad de las Artes (ISA) de Cuba como Licenciada en Música, con especialización en Dirección Musical de Sonido, y formada como violinista en el prestigioso Conservatorio Esteban Salas, Ilena ha construido una destacada trayectoria como profesora de música, teatro musical y musicoterapeuta. Paralelamente, ha desarrollado una exitosa carrera como ingeniera de sonido en reconocidos estudios de grabación y producciones musicales, trabajando con importantes artistas y proyectos de alto nivel. Esta experiencia profesional le permite ofrecer una **enseñanza integral** que combina interpretación, técnica, creatividad y una profunda comprensión del proceso artístico.",
          "Como fundadora de Alondra Music Academy, Ilena ha creado una academia donde **la excelencia académica y la atención personalizada** son la base de cada programa. Su metodología se adapta a las fortalezas, necesidades y objetivos de cada estudiante, promoviendo un aprendizaje dinámico, motivador y significativo. Más que enseñar a tocar un instrumento, su propósito es despertar el amor por la música, formar músicos seguros y creativos, y brindar a cada alumno las herramientas necesarias para **alcanzar su máximo potencial** tanto dentro como fuera del escenario. En Alondra imparte personalmente clases de violín, canto, piano y arte del sonido.",
        ],
      },
      team: [
        {
          slug: "profe-olivia",
          name: "Olivia García Rey",
          role: "Profesora de piano",
          photo: "/images/profe-olivia.webp",
          summary: "Pianista y educadora con **más de tres décadas de experiencia**, reconocida por su enfoque humano y personalizado en la pedagogía del piano, que además ejerció como musicoterapeuta en una etapa anterior de su carrera.",
          bio: [
            "Conoce a Olivia García Rey, una distinguida pianista y educadora que, en una etapa anterior de su carrera, ejerció como musicoterapeuta, con **más de tres décadas de experiencia** formando músicos y cultivando el talento de niños, jóvenes y adultos. Su sólida preparación en prestigiosas instituciones musicales de Cuba, junto con una extensa trayectoria como profesora en conservatorios y escuelas de arte, la convierten en una maestra de excepcional nivel, reconocida por su profundo conocimiento de la pedagogía del piano, la interpretación y la formación integral del músico.",
            "A lo largo de su carrera, Olivia ha guiado a cientos de estudiantes, ayudándolos a desarrollar no solo una excelente técnica pianística, sino también **disciplina, sensibilidad artística y confianza en sí mismos**. Su experiencia como musicoterapeuta le ha permitido comprender el impacto de la música en el desarrollo cognitivo, emocional y social, enriqueciendo su metodología con un enfoque humano, cercano y completamente personalizado, adaptado a las fortalezas, necesidades y objetivos de cada alumno.",
            "En Alondra Music Academy, Olivia comparte su pasión por la música con el compromiso de inspirar a cada estudiante a **alcanzar su máximo potencial**. Sus clases ofrecen mucho más que aprender a tocar el piano: brindan una **formación artística de alta calidad** que fomenta la creatividad, la expresión musical, el desarrollo integral y un amor por la música que perdura toda la vida.",
          ],
        },
        {
          slug: "profe-rafael",
          name: "Rafael Paseiro",
          role: "Profesor de guitarra y bajo eléctrico",
          photo: "/images/profe-rafael.webp",
          summary: "Bajista, compositor y arreglista con **más de tres décadas de trayectoria internacional**; en Alondra enseña guitarra y bajo eléctrico.",
          bio: [
            "Rafael Paseiro es un reconocido bajista, compositor, arreglista y profesor de guitarra con **más de tres décadas de experiencia** en la música. **Graduado con honores** de la Escuela Nacional de Arte de Cuba bajo la tutela del prestigioso bajista Carlos del Puerto, ha desarrollado una sobresaliente carrera que combina la interpretación, la composición, los arreglos musicales y una profunda vocación por la enseñanza.",
            "Como intérprete, compositor y arreglista, Rafael ha colaborado en numerosas producciones discográficas y ha compartido escenario con destacados artistas como Issac Delgado, Gonzalo Rubalcaba, Harold López-Nussa, Roberto Carcassés, Raúl Paz y The Temptations, entre muchos otros. Su talento lo ha llevado a presentarse en algunos de los festivales de jazz más importantes del mundo y a realizar giras por América, Europa, Asia y el Caribe, consolidándose como un músico de **reconocido prestigio internacional**.",
            "En Alondra Music Academy, Rafael comparte su amplia experiencia para formar a la nueva generación de músicos a través de una enseñanza personalizada de guitarra y bajo eléctrico. Su metodología combina una **sólida formación técnica** con el desarrollo de la creatividad, la expresión musical y la confianza en cada estudiante, inspirando a niños, jóvenes y adultos a descubrir y **alcanzar su máximo potencial** artístico.",
          ],
        },
        {
          slug: "profe-claudia-nuevo",
          name: "Claudia Nuevo",
          role: "Profesora de piano y flauta",
          photo: "/images/profe-claudia-nuevo.webp",
          summary: "Pianista y flautista formada en el Conservatorio Esteban Salas y el ISA; ofrece **clases dinámicas y personalizadas** centradas en cada estudiante.",
          bio: [
            "Conoce a Claudia Nuevo, una talentosa pianista, flautista y educadora apasionada por inspirar a sus estudiantes a través de la música. Graduada del prestigioso Conservatorio Esteban Salas y con estudios en Producción y Grabación Musical en la Universidad de las Artes (ISA) de Cuba, combina una **sólida formación académica** con una destacada trayectoria como intérprete y docente.",
            "A lo largo de su carrera ha enseñado piano y flauta en reconocidas instituciones musicales, además de participar como pianista acompañante e integrante de orquestas, coros, bandas y agrupaciones profesionales. Su experiencia internacional y su vocación por la enseñanza le permiten ofrecer clases dinámicas, personalizadas y enfocadas en el **crecimiento integral de cada estudiante**.",
            "En Alondra Music Academy, Claudia crea un ambiente donde la técnica, la creatividad y la expresión musical se desarrollan de manera natural. Su objetivo es que cada alumno no solo aprenda a tocar un instrumento, sino que **gane confianza**, disfrute del aprendizaje y descubra una pasión por la música que lo acompañe toda la vida.",
          ],
        },
        {
          slug: "profe-claudia-rodriguez",
          name: "Claudia D. Rodríguez",
          role: "Profesora de eufonio, canto y piano",
          photo: "/images/profe-claudia-rodriguez.webp",
          summary: "Eufonista, cantante y educadora; especialista en **eufonio, tuba y música de cámara**, con trayectoria internacional dentro y fuera de Cuba.",
          bio: [
            "Conoce a Claudia D. Rodríguez, una talentosa eufonista, cantante y educadora musical apasionada por formar estudiantes con **excelencia, creatividad y amor por la música**. Su sólida preparación académica y su amplia experiencia como docente e intérprete le permiten ofrecer una enseñanza dinámica y personalizada, inspirando a alumnos de todas las edades a desarrollar su máximo potencial.",
            "Graduada de la Universidad de las Artes (ISA) de Cuba como Licenciada en Música, con **especialización en Eufonio**, y formada en el prestigioso Conservatorio Esteban Salas, Claudia ha impartido clases de eufonio, tuba, piano y música de cámara en reconocidas instituciones musicales. Además, ha desarrollado una destacada trayectoria como instrumentista y cantante, participando en bandas de concierto, coros profesionales y agrupaciones internacionales, presentándose en escenarios dentro y fuera de Cuba.",
            "En Alondra Music Academy, Claudia crea un ambiente de aprendizaje motivador donde **la técnica, la expresión artística y la confianza** crecen de la mano. Su compromiso es que cada estudiante disfrute del proceso de aprender música, fortalezca sus habilidades y descubra una pasión que lo acompañe durante toda la vida.",
          ],
        },
        {
          slug: "profe-mayda",
          name: "Mayda Placeres",
          role: "Profesora de piano",
          photo: "/images/profe-mayda.webp",
          summary: "Pianista y profesora con **más de tres décadas de experiencia** en los conservatorios de Cuba y México, que hoy enseña piano a niños en Miami.",
          bio: [
            "Mayda Placeres se formó en la Escuela Nacional de Música de La Habana, donde obtuvo su título en Música con **especialización en piano**, y más tarde cursó un postgrado en Patrimonio Musical e Historiografía de la Música en la Universidad San Gerónimo de La Habana. Su carrera docente empezó en esa misma escuela, donde impartió clases de piano durante **dos décadas**.",
            "Después enseñó en el Conservatorio Nacional de Música de México, en Ciudad de México, antes de instalarse en el sur de Florida, donde da clases de piano a niños desde 2022. A lo largo de treinta años y tres países, su trabajo ha combinado un **dominio avanzado del piano clásico** con un profundo conocimiento de la teoría musical y una atención constante a lo que de verdad funciona en una clase: técnica clara, métodos de enseñanza eficaces y una relación cercana con cada estudiante.",
            "En Alondra Music Academy, Mayda enseña piano a niños y jóvenes. Sus clases construyen **bases técnicas sólidas** sin perder la motivación que hace que un niño quiera volver al instrumento: el equilibrio que ha ido afinando en una carrera hecha en conservatorios y, sobre todo, delante de los alumnos.",
          ],
        },
      ],
    },
    coverage: {
      eyebrow: "Zonas de Cobertura",
      title: "Atendemos Miami-Dade y Broward",
      subtitle: "Llevamos las clases **directamente a tu hogar** en todo el sur de Florida.",
      citiesTitle: "Ciudades",
      citiesNote: "¿No ves tu ciudad? Estamos abiertos a otras zonas. Contáctanos para coordinar **clases a domicilio personalizadas**.",
      schedule: "Horario",
      scheduleBody: "Clases a domicilio en toda el área de Miami, en un **horario que se adapta a tu vida**.",
      daysOpen: "Lunes a Sábado",
      hoursOpen: "8:00 – 20:00",
      daysClosed: "Domingo",
      hoursClosed: "Cerrado",
      contactsTitle: "Contactos",
      mapUnavailable: "El mapa no se pudo cargar ahora.",
      mapCta: "Abrir en Google Maps",
      cities: ["Coral Gables", "Doral", "Flagami", "Westchester", "Sweetwater", "South Miami", "Dadeland", "Kendall", "Hialeah", "Miami Springs", "Miami Lakes"],
    },
    faq: {
      eyebrow: "Preguntas Frecuentes",
      title: "Preguntas frecuentes",
      items: [
        { q: "¿A qué edad se puede empezar?", a: "Recibimos estudiantes desde los 0 años en nuestro **programa de estimulación temprana**. El estudio instrumental formal inicia usualmente a los 4 años, y no hay límite de edad para empezar, adultos incluidos." },
        { q: "¿Aceptan estudiantes adultos?", a: "Sí. Los niños son nuestro público principal, pero enseñamos a **estudiantes de todas las edades**. No hay límite de edad para empezar. Adaptamos el repertorio y el ritmo a cada alumno." },
        { q: "¿Realmente van a nuestra casa?", a: "Sí, todas las clases **se imparten a domicilio** en Miami-Dade y Broward." },
        { q: "¿Cómo verifican a sus profesores?", a: "Cada instructor pasa por una estricta **verificación de antecedentes a nivel estatal y nacional** (Background Check), una evaluación de aptitud psicológica y una auditoría técnica musical. Nos aseguramos de que solo profesionales verificados, talentosos y con una profunda sensibilidad humana **entren a la comodidad de tu hogar**." },
        { q: "¿Con qué instrumento debe empezar mi hijo?", a: "El instrumento ideal se elige equilibrando su edad (madurez motriz) con sus propias preferencias e intereses. Para garantizar que comience con el pie derecho, ofrecemos una **llamada de descubrimiento gratuita** donde evaluamos su perfil y agendamos su clase con el especialista idóneo, asegurando un inicio motivador y personalizado desde el primer día." },
        { q: "¿Cuánto dura una clase típica?", a: "El formato estándar para la mayoría de los instrumentos y el **programa de estimulación temprana** es de 45 minutos, ajustándose a 60 minutos para niveles avanzados. Las sesiones de 30 minutos están disponibles únicamente cuando se inscriben más de dos estudiantes en el mismo hogar, optimizando la dinámica familiar." },
        { q: "¿Ustedes proveen el instrumento?", a: "Al principio sí: si necesitas unos días para conseguir el tuyo, llevamos el instrumento a la clase para que tu hijo no pierda tiempo. Pero es una solución temporal, y sí recomendamos comprar uno: **el niño necesita un instrumento en casa para practicar durante la semana**, y es esa práctica entre clase y clase donde ocurre de verdad el progreso. Te damos una **guía experta de compra y configuración** para que elijas el adecuado de forma fácil y segura." },
        { q: "¿Pueden los hermanos compartir clase?", a: "Sí, ofrecemos **descuentos para hermanos** y formatos de clase compartida cuando la edad lo permite." },
        { q: "¿Qué pasa si necesitamos reprogramar?", a: "Si nos avisas con **más de 24 horas de anticipación**, la clase se reprograma sin problema. Para cancelaciones de última hora, la sesión se considerará impartida, salvo en casos de emergencias o imprevistos médicos demostrables. Además, si se presentan ausencias frecuentes en un mismo mes, se repondrá el 50% de las clases para cuidar la continuidad de tu hijo." },
        { q: "¿Hay recitales o presentaciones?", a: "Sí. Los **recitales de temporada** forman parte del programa de la academia: son la ocasión para que cada estudiante comparta su progreso con su familia y su comunidad. Las fechas se anuncian con antelación a las familias inscritas." },
        { q: "¿Cómo me inscribo?", a: "¡Es muy sencillo! Solo haz clic en nuestro botón de Contáctanos para escribirnos por WhatsApp o completa el formulario del sitio. En menos de 48 horas coordinaremos tu **llamada telefónica de descubrimiento gratuita** para conocer a tu hijo y asignarle al profesor especialista ideal." },
      ],
    },
    stepUp: {
      eyebrow: "Step Up For Students",
      title: "Si tu familia tiene fondos de Step Up, puedes usarlos aquí",
      body: "Somos **proveedor directo**, así que las clases se pagan desde la beca sin que tengas que adelantar el dinero y reclamarlo después. Pero no es lo único que lo hace viable: donde se atascan casi todas las familias es en el trámite.",
      points: [
        { title: "Proveedor directo", body: "Los fondos van a la academia. Sin adelantar dinero y sin esperar un reembolso." },
        { title: "Te ayudamos con el trámite", body: "La parte que la primera vez se lleva una tarde. Ya lo hemos hecho y te acompañamos." },
        { title: "En inglés, español o francés", body: "El trámite incluido. Si los formularios no están en tu idioma, es ahí donde se abandona." },
        { title: "A domicilio, como siempre", body: "Usar la beca no cambia nada de cómo funciona la clase." },
      ],
      note: "No decidimos quién califica: eso lo decide Step Up y sus requisitos cambian. Lo que hacemos es que usar los fondos sea sencillo una vez los tienes.",
    },
    ctaBanner: {
      title: "¿Listos para comenzar tu viaje musical?",
      body: "Reserva una **llamada de conocimiento gratuita** y encontramos el instructor ideal para tu hijo.",
      button: "Agenda tu llamada gratuita de 15 min",
    },
    widget: {
      title: "Completa tu inscripción",
      body: "¿Ya tuviste tu llamada de conocimiento? Confirma aquí tu horario semanal. Con tecnología de My Music Staff.",
      placeholder: "Aquí se incrustará el widget de inscripción de My Music Staff.",
      loading: "Cargando el calendario…",
      errorTitle: "El calendario no se cargó",
      retry: "Reintentar",
      directHelp: "¿Prefieres reservar directamente? Escríbenos por WhatsApp o correo y lo coordinamos contigo.",
    },
    notFound: { title: "Página no encontrada", body: "Este enlace está roto o la página se ha movido. No es un problema de tu navegador.", back: "Volver al inicio", requested: "Pediste", elsewhere: "O ve directamente a" },
    skipToContent: "Saltar al contenido",
    programs: {
      hero: {
        eyebrow: "Formatos e instrumentos",
        title: "Un camino para cada músico",
        subtitle: "Siete disciplinas, impartidas en tres formatos, cada camino pensado para tu hijo. Haz clic en cada disciplina para ver el método y cómo se nota el progreso.",
      },
      offer: {
        theoryFree: "La teoría musical está incluida gratis en todas las disciplinas.",
        voiceException: "Canto es la única excepción: las clases de teoría se cobran aparte.",
        includesLabel: "Disciplinas incluidas",
        methodLabel: "El Método",
        progressLabel: "El Progreso",
        shortTermLabel: "A corto plazo (1–3 meses)",
        longTermLabel: "A largo plazo",
      },
      disciplines: [
        { key: "piano", name: "Piano", tagline: "Dos manos, dos claves y toda la armonía bajo los dedos.", focus: "Independencia de cada mano, lectura simultánea en clave de Sol y de Fa, y un toque parejo en todo el teclado.", method: "Combinamos la precisión técnica de la escuela clásica con un enfoque de lectura ágil y adaptada. Desde las primeras lecciones, el niño trabaja la **independencia de ambas manos** y la lectura simultánea en clave de Sol y clave de Fa.", progress: { short: "Postura correcta ante el teclado, reconocimiento de notas musicales y ejecución de sus primeras melodías fluidas a dos manos.", long: "Leer a primera vista una pieza que nunca ha escuchado, y un repertorio que puede tocar de principio a fin para alguien." } },
        { key: "violin", name: "Violín", tagline: "La afinación se construye con el oído y con el brazo.", focus: "Sujeción del arco y posición de la mano izquierda, afinar sin trastes que guíen, y control del arco para un sonido estable.", method: "Basado en la **disciplina postural y la educación del oído**. Implementamos un sistema progresivo que prioriza la afinación precisa y la colocación del arco antes de avanzar a técnicas complejas, manteniendo la motivación activa.", progress: { short: "Control del arco, postura corporal relajada, estabilidad en el agarre del instrumento y producción de un tono limpio.", long: "Afinación limpia en las posiciones estudiadas, sonido sostenido y capacidad de afinar su propio instrumento." } },
        { key: "flute", name: "Flauta", tagline: "Aire convertido en sonido.", focus: "Embocadura, apoyo de la respiración, articulación limpia y frasear una línea sin quedarse sin aire.", method: "Centrado en el control del aire y el fraseo elegante. El programa une la técnica de embocadura tradicional con la lectura rítmica estricta, de modo que el **control de la respiración** sostiene la frase hasta el final.", progress: { short: "Emisión de un sonido claro y sostenido, posición correcta de las manos y ejecución de escalas y melodías iniciales.", long: "Sonido estable en los registros estudiados, articulación controlada y frases llevadas hasta el final." } },
        { key: "guitar", name: "Guitarra", tagline: "Acordes, melodía y acompañamiento en las mismas seis cuerdas.", focus: "Lectura de partitura y de tablatura, cambios de acorde limpios, y patrones de mano derecha para acompañar.", method: "Un trayecto versátil que abarca desde la guitarra clásica hasta la acústica y contemporánea. El alumno aprende la lectura de **partituras y tablaturas** en paralelo, combinando melodías solistas con rítmica de acompañamiento.", progress: { short: "Fuerza y agilidad inicial en los dedos, transiciones limpias entre acordes básicos y ejecución de ritmos sencillos.", long: "Acompañar una canción de principio a fin, tocar una melodía con digitación propia y leer un cifrado nuevo." } },
        { key: "bass", name: "Bajo Eléctrico", tagline: "El instrumento que sostiene a una banda.", focus: "Digitación en ambas manos, tocar con metrónomo, y leer líneas de bajo y cifrado.", method: "Diseñado para explorar el bajo como un instrumento individual de gran carácter melódico, sin descuidar su rol como el **corazón rítmico de una agrupación**. Se enfoca en la teoría armónica aplicada, el tempo y el sentido del groove.", progress: { short: "Sincronización rítmica perfecta, técnica de digitación en ambas manos y ejecución de líneas de bajo fundamentales.", long: "Sostener el tempo sin metrónomo, construir una línea sobre un cifrado y encajar con una batería." } },
        { key: "voice", name: "Canto", tagline: "El instrumento que se lleva puesto.", focus: "Respiración diafragmática, emisión sana para la anatomía infantil, dicción y afinación.", method: "Un enfoque de entrenamiento vocal saludable diseñado específicamente para la anatomía infantil. Integramos ejercicios lúdicos de **respiración diafragmática**, dicción y resonancia, cuidando siempre su salud vocal.", progress: { short: "Afinación básica, **control de la respiración** consciente y superación del miedo escénico inicial.", long: "Un rango cómodo que usa sin forzar, dicción clara, y una canción preparada lo bastante bien como para cantarla ante gente." } },
        { key: "soundArt", name: "El arte del sonido", tagline: "Hacer música con un ordenador.", focus: "Grabación, edición y nociones de mezcla, más la teoría necesaria para arreglar lo que se compone.", method: "Un laboratorio creativo e interactivo. Fusionamos los fundamentos de la teoría musical y la acústica básica con el uso de **programas digitales de producción**. El estudiante aprende a estructurar sus propias ideas musicales y a entender cómo viaja y se transforma el sonido.", progress: { short: "Comprensión del entorno digital, creación de sus primeras secuencias rítmicas y reconocimiento de frecuencias y texturas sonoras básicas.", long: "Una pieza terminada, grabada, arreglada y mezclada por el alumno de principio a fin." } },
      ],
      formats: [
        {
          key: "individual",
          label: "Individual",
          tag: "Todas las disciplinas",
          title: "Clases individuales",
          body: "**Clases uno a uno** diseñadas por completo alrededor de un solo estudiante: ritmo, repertorio y objetivos ajustados clase a clase. Disponible para todas las disciplinas, con la teoría musical incluida sin costo adicional.",
          points: ["Un instructor dedicado para un solo estudiante.", "Currículo y repertorio **totalmente personalizado**s.", "Teoría musical incluida gratis, aparte en Canto."],
        },
        {
          key: "pianoLab",
          label: "Laboratorio de piano",
          tag: "Piano · Grupo reducido",
          title: "Laboratorio de piano",
          body: "Varios estudiantes aprenden piano en la misma sala al mismo tiempo, cada uno en su propio teclado digital premium, con audífonos. El profesor rota de estación en estación, dando a cada estudiante **tiempo uno a uno** para pulir la técnica y fijar nuevos hitos. Nadie se queda atrás ni va apurado por el grupo.",
          points: ["Cada estudiante en su propio teclado digital premium, con audífonos.", "El profesor rota para dar atención uno a uno en cada estación.", "El avance de una clase privada dentro de un ambiente social e inspirador."],
        },
        {
          key: "littleMozart",
          label: "Little Mozart",
          tag: "0 a 4 años",
          title: "Little Mozart",
          body: "Un programa especial de primera infancia creado personalmente por nuestra fundadora, Ilena Peña Fernández. Basado en los **métodos Orff, Kodály y Suzuki**, despierta la musicalidad en los más pequeños, de 0 a 4 años, mediante la exploración rítmica y vocal, el movimiento y el juego.",
          points: ["Creado personalmente por la fundadora Ilena Peña Fernández.", "Basado en los **métodos Orff, Kodály y Suzuki**, para edades de 0 a 4 años.", "Ritmo, canto y un primer contacto con el piano, el violín y la guitarra."],
        },
      ],
      journey: {
        eyebrow: "Tu viaje por nuestra academia",
        title: "De la primera nota al dominio total",
        subtitle: "Un recorrido claro y estructurado. Cada etapa se describe por **lo que el alumno sabe hacer**, no por lo que le prometemos.",
        steps: [
          { title: "Conexión", body: "Una primera llamada para conocer la edad, los intereses y los horarios del niño antes de asignarle instrumento y profesor." },
          { title: "Iniciación", body: "Postura, primeras notas y lectura del pentagrama: el niño toca piezas cortas leyendo, no imitando." },
          { title: "Evolución", body: "Piezas más largas, tempo más estable y las primeras dinámicas. El alumno empieza a preparar una pieza para tocarla ante alguien." },
          { title: "Autonomía", body: "Leer una partitura nueva sin ayuda, mantener un repertorio listo y empezar a improvisar sobre lo que ya conoce." },
          { title: "Dominio", body: "Un repertorio que toca de principio a fin, lectura a primera vista y la preparación que pide una audición o una certificación." },
        ],
      },
    },
    about: {
      hero: { eyebrow: "Sobre Nosotros", title: "Una formación musical diseñada para trascender", subtitle: "Consolidamos un estándar educativo de nivel internacional **en la comodidad de tu hogar**. Nos dedicamos a **cultivar el potencial artístico** de los jóvenes estudiantes bajo un marco ético riguroso, combinando metodologías de clase mundial con una guía cálida, cercana y transparente." },
      mission: {
        title: "Nuestra filosofía",
        blocks: [
          { heading: "Conectando la ciencia pedagógica con la sensibilidad artística", body: "Cada clase integra **técnica, ritmo, lectura e interpretación**, adaptadas a la manera de aprender de cada estudiante." },
          { heading: "Excelencia pedagógica guiada por nuestra fundadora", body: "Alondra Music Academy está dirigida personalmente por su **directora fundadora**. Cada sesión es impartida de forma exclusiva por profesionales de la alta escuela clásica, rigurosamente formados y con **antecedentes totalmente verificados** para tu absoluta tranquilidad." },
        ],
      },
      teamLink: {
        title: "Conoce a los profesores",
        body: "Ilena elige personalmente el profesor que mejor conecta con cada alumno. Su formación, sus instrumentos y sus biografías completas están en su propia página.",
        cta: "Ver los profesores",
      },
      verification: {
        eyebrow: "Seguridad Primero",
        title: "Cómo verificamos a cada instructor",
        subtitle: "Porque la confianza no es opcional cuando se trata de tus hijos.",
        steps: [
          { title: "Background Check", body: "Verificación exhaustiva de **antecedentes penales y registros federales** a través de proveedores certificados en los EE. UU." },
          { title: "Evaluación Psicológica", body: "Entrevistas estructuradas que examinan la **inteligencia emocional, la empatía** y la comunicación pedagógica con menores." },
          { title: "Certificación Técnica", body: "Audiciones de aptitud y **demostraciones docentes en vivo**, evaluadas estrictamente por nuestra dirección académica." },
          { title: "Formación Continua", body: "Capacitación trimestral obligatoria en desarrollo infantil, práctica pedagógica y **protocolos avanzados de protección al menor**." },
        ],
        compliance: {
          title: "En regla y con seguro completo",
          items: [
            { label: "Verificados Nivel 2 (FDLE)", body: "Cada instructor superó la toma de huellas y la **verificación de Nivel 2** del Departamento de Aplicación de la Ley de Florida." },
            { label: "Seguro de $1M", body: "Una **póliza de responsabilidad civil de $1,000,000** (CPH Insurance) respalda cada clase que impartimos." },
            { label: "LLC registrada en Florida", body: "Alondra es una **Sociedad de Responsabilidad Limitada (LLC) registrada y activa** en el estado de Florida." },
          ],
        },
      },
    },
    registration: {
      hero: { eyebrow: "Precios", title: "Lo que cuesta una clase", subtitle: "Dos formatos, los dos a domicilio en Miami-Dade y Broward. Hay descuento por hogar y por frecuencia desde el segundo miembro." },
      enrollCta: "Inscribirme ahora",
      enrollQualifier: "¿Ya hiciste tu llamada?",
      pricingTitle: "Tarifas transparentes y sin sorpresas",
      pricingSubtitle: "**Sin contratos forzosos ni cargos ocultos**. Elige el formato ideal para los objetivos y el ritmo de aprendizaje de tu hijo.",
      priceFrom: "desde",
      priceLabel: "/ clase",
      formats: [
        { name: "Lección Privada", description: "Enfoque individualizado y **totalmente personalizado** según las metas específicas del alumno.", price: "$50", points: ["Instructor dedicado al 100%", "Plan de estudio a tu propio ritmo"] },
        { name: "Lección Compartida", description: "Formato de alta escuela impartido en **grupos pequeños de 3 a 6 estudiantes**.", price: "$35", points: ["Socialización y motivación mutua", "Instrucción técnica individualizada"] },
      ],
      lessonLengthTitle: "Cuánto dura una clase",
      lessonLength: "45 minutos es el estándar para la mayoría de los instrumentos y para el **programa de estimulación temprana**, y 60 minutos para niveles avanzados. Las sesiones de 30 minutos sólo cuando se inscriben más de dos estudiantes en el mismo hogar.",
      benefits: {
        title: "Más música, mayores ahorros",
        subtitle: "Acompañamos la constancia de tu hogar con **ventajas competitivas** aplicadas automáticamente en tu facturación mensual de Stripe:",
        items: [
          { title: "Descuento Multi-Familiar", body: "Obtén un **descuento especial del 10%** en tu membresía mensual a partir del segundo miembro de la casa inscrito." },
          { title: "Descuento por Frecuencia", body: "Recibe una **tarifa preferencial por lección** al programar dos o más clases semanales por alumno." },
        ],
      },
      note: "El precio final se confirma al contactarnos, según **la duración y la frecuencia**.",
    },
    enroll: {
      hero: { eyebrow: "Inscripción", title: "Inscripción y matrícula", subtitle: "Todo lo que necesitas para unirte a Alondra: los tres pasos, nuestro acuerdo simple y el formulario que **reserva tu horario semanal**." },
      stepsTitle: "El camino más simple para iniciar",
      stepsSubtitle: "Diseñamos un **proceso ágil y transparente** para que tu familia comience su viaje musical sin complicaciones y con **total seguridad**.",
      steps: [
        { title: "Contáctanos", body: "Escríbenos por WhatsApp o completa nuestro formulario en línea. Evaluamos el perfil de tu hijo y asignamos a la instructora ideal **en menos de 48 horas**." },
        { title: "Firma del Acuerdo", body: "Recibe de forma digital nuestro acuerdo transparente de políticas de estudio, diseñado para establecer expectativas claras y **proteger a tu familia**." },
        { title: "Reserva tu Lugar", body: "Confirma tu horario semanal recurrente y ¡listo! Las clases de alta escuela comienzan directamente en la **comodidad y seguridad de tu propio hogar**." },
      ],
      contract: {
        title: "Transparencia total, sin contratos a largo plazo",
        body: "Nuestro acuerdo está diseñado bajo los estándares de los EE. UU. para darte **total claridad y paz mental** desde el primer día:",
        points: [
          { label: "Membresía Mensual Fija", body: "**Pagos automáticos automatizados vía Stripe** (Auto-Pay) cada día 1 del mes." },
          { label: "Aviso Obligatorio de 24h", body: "**Reprogramación flexible** notificando tus ausencias con 24 horas de anticipación." },
          { label: "Baja Flexible de 15 Días", body: "**Cancela o pausa tu servicio** avisando 15 días antes de iniciar el siguiente mes." },
          { label: "Entorno Seguro en Casa", body: "Exigimos la **presencia física de un adulto** en el hogar durante toda la lección." },
        ],
      },
    },
    contact: {
      hero: { eyebrow: "Contacto y Cobertura", title: "Vamos a tu casa", subtitle: "Atendemos estudiantes en Miami-Dade y Broward con **calidez y precisión**." },
      citiesTitle: "Ciudades que atendemos con orgullo",
      citiesBody: "Desde Coral Gables y Doral hasta Kendall, Hialeah y más allá, Alondra Music Academy lleva **clases privadas premium** **directamente a tu hogar** en toda el área de Miami. ¿No ves tu ciudad? Contáctanos para coordinar algo a tu medida.",
      mapTitle: "Mapa de cobertura",
      formTitle: "Contáctanos",
      formSubtitle: "Cuéntanos para quién son las clases. Respondemos en menos de 24 horas.",
      fields: {
        name: "Nombre completo", student: "Nombre o inicial del estudiante", age: "Edad del estudiante",
        email: "Correo", phone: "Teléfono", zip: "Código postal",
        instrument: "Instrumento de interés", channel: "¿Cómo prefieres que te respondamos?",
        source: "¿Cómo conociste Alondra?", availability: "Disponibilidad aproximada",
        message: "¿Algo más que debamos saber?",
        choose: "Selecciona una opción",
        submit: "Enviar mensaje",
        terms: "Acepto los términos y condiciones del tratamiento de mis datos personales.",
        promo: "También quiero recibir novedades de la academia por correo. (Opcional)",
      },
      channelOptions: ["WhatsApp", "Llamada telefónica", "Correo electrónico"],
      sourceOptions: ["Nextdoor", "Búsqueda en Google", "Instagram o Facebook", "Me la recomendó una familia", "En otro sitio"],
      sending: "Enviando…",
      errorSend: "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a alondramusicacademy@gmail.com.",
      successTitle: "¡Gracias!",
      successBody: "Hemos recibido tu mensaje y responderemos en menos de 24 horas.",
      successAgain: "Enviar otro mensaje",
      infoTitle: "Contacto directo",
      infoEmail: "alondramusicacademy@gmail.com",
      infoPhone: "+1 (786) 843-1028",
      infoHours: "Horario de atención",
      infoHoursValue: "Lun–Sáb · 8:00 – 20:00 · Dom cerrado",
    },
    footer: {
      tagline: "**Conexión que inspira. Progreso que se escucha.** Clases de música a domicilio en Miami-Dade y Broward.",
      columns: [
        { title: "Academia", links: [{ label: "Inicio", page: "home" }, { label: "Formatos", page: "programs" }, { label: "Profesores", page: "teachers" }, { label: "Academia", page: "about" }] },
        { title: "Inscripción", links: [{ label: "Precios", page: "registration" }, { label: "Inscripción", page: "enroll" }, { label: "Contacto", page: "contact" }, { label: "Trabaja con nosotros", page: "careers" }] },
      ],
      contact: "Contacto",
      rights: "Todos los derechos reservados.",
      privacy: "Privacidad",
      terms: "Términos",
    },
    errors: { required: "Este campo es obligatorio", email: "Ingresa un correo válido", phone: "Ingresa un teléfono válido", zip: "Escribe un código postal de 5 dígitos" },
    legal: {
      eyebrow: "Legal",
      updated: "Última actualización: 20 de julio de 2026",
      footerHeading: "Legalidad",
      links: { privacy: "Política de Privacidad", cookies: "Política de Cookies", notice: "Notas Legales" },
      privacy: {
        title: "Política de Privacidad",
        intro:
          "Esta Política de Privacidad explica cómo Alondra Music Academy (“Alondra”, “nosotros”) recopila, usa y protege la información personal de las familias y los visitantes. Alondra opera desde Florida, en Estados Unidos, y esta política se redacta conforme a la legislación estadounidense.",
        sections: [
          { heading: "Información que recopilamos", body: "Recopilamos la información que decides darnos: a través de nuestro formulario de contacto (nombre, correo, teléfono, ciudad y mensaje); a través de nuestro formulario de empleo (nombre, correo, teléfono, el puesto al que aplicas, tu mensaje y el currículum/CV que adjuntes); y los datos del estudiante que un padre, madre o tutor proporciona al inscribirlo. También recibimos datos técnicos básicos (como dispositivo, navegador y dirección IP) que se recaban automáticamente cuando usas el sitio, tanto por los servicios de terceros integrados como por Google Analytics, que utilizamos para medir de forma agregada el uso del sitio." },
          { heading: "Cómo usamos tu información", body: "Usamos tu información para responder consultas, agendar e impartir clases, procesar la inscripción, revisar solicitudes de empleo y comunicarnos contigo. No vendemos tu información personal ni la compartimos para publicidad conductual cross-context." },
          { heading: "Proveedores y terceros", body: "Compartimos información únicamente con los proveedores que nos ayudan a operar la academia: My Music Staff (nuestra herramienta integrada de agenda y registro); Google (Gmail procesa y entrega los mensajes que envías por nuestros formularios, y Google Maps muestra nuestro mapa de cobertura); y WhatsApp/Meta, si eliges contactarnos por WhatsApp. Cada uno tiene su propia política de privacidad. Los currículums que envías nos llegan por correo y no se almacenan en nuestro servidor. También podemos divulgar información cuando lo exige la ley." },
          { heading: "Privacidad de menores", body: "Este sitio está dirigido a padres, madres y tutores, no a niños. No recopilamos a sabiendas información personal directamente de menores de 13 años; cualquier dato sobre un estudiante lo proporciona un padre, madre o tutor, que consiente en nombre del menor. Si crees que un menor nos ha dado información personal, contáctanos y la eliminaremos." },
          { heading: "Tus derechos de privacidad", body: "Según dónde vivas, puedes tener derecho a acceder, corregir, eliminar u obtener una copia de tu información personal, y a oponerte a la venta de tus datos o a la publicidad dirigida (ninguna de las cuales realizamos). Los residentes de Florida tienen estos derechos bajo la Florida Digital Bill of Rights, y los de California bajo la CCPA/CPRA; los residentes de otros estados pueden tener derechos similares. No te discriminaremos por ejercerlos. Para hacer una solicitud, escríbenos al correo indicado abajo." },
          { heading: "Conservación y seguridad", body: "Conservamos la información personal solo el tiempo necesario para los fines descritos (los envíos de formularios nos llegan como correo gestionado a través de Gmail) y aplicamos medidas razonables para protegerla. Ningún método de transmisión por internet es completamente seguro." },
          { heading: "Contacto", body: "¿Dudas sobre esta política? Escríbenos a alondramusicacademy@gmail.com o llama al +1 (786) 843-1028." },
        ],
      },
      cookies: {
        title: "Política de Cookies",
        intro:
          "Esta Política de Cookies describe cómo Alondra Music Academy usa cookies y tecnologías similares en nuestro sitio web. Alondra opera desde Florida, en Estados Unidos.",
        sections: [
          { heading: "Qué son las cookies y tecnologías similares", body: "Las cookies son pequeños archivos de texto guardados en tu dispositivo que ayudan a que los sitios funcionen y recuerden preferencias. También usamos el almacenamiento local (local storage) de tu navegador con el mismo fin, por ejemplo, para recordar el idioma o el tema seleccionado." },
          { heading: "Cómo las usamos", body: "Usamos almacenamiento funcional y analítica. Guardamos localmente en tu navegador (local storage) tu idioma y tu preferencia de tema claro/oscuro para que el sitio se mantenga como lo dejaste. También usamos Google Analytics, que instala cookies para medir cómo se utiliza el sitio. No usamos cookies de publicidad ni empleamos estas cookies para identificarte personalmente." },
          { heading: "Cookies de terceros", body: "Algunas funciones dependen de servicios de terceros integrados (nuestro agendador My Music Staff y el mapa de cobertura de Google Maps) que pueden instalar sus propias cookies, sujetas a sus respectivas políticas de privacidad. Google Analytics también instala sus propias cookies, regidas por la política de privacidad de Google. Puedes desactivar Google Analytics en todos los sitios mediante el complemento de inhabilitación que ofrece Google para tu navegador." },
          { heading: "Gestión de cookies y almacenamiento local", body: "Puedes controlar o eliminar las cookies y el almacenamiento local desde la configuración de tu navegador. Borrarlos puede restablecer tus preferencias guardadas, como el idioma o el tema." },
          { heading: "Contacto", body: "¿Dudas sobre nuestro uso de cookies? Escríbenos a alondramusicacademy@gmail.com." },
        ],
      },
      notice: {
        title: "Notas Legales",
        intro:
          "Estas Notas Legales establecen los términos que rigen el uso del sitio web de Alondra Music Academy. Alondra opera desde Florida, en Estados Unidos.",
        sections: [
          { heading: "Titular del sitio", body: "Este sitio es operado por Alondra Music Academy, con sede en Florida, Estados Unidos. Contacto: alondramusicacademy@gmail.com · +1 (786) 843-1028." },
          { heading: "Uso del sitio", body: "El contenido de este sitio se ofrece como información general sobre nuestras clases y servicios de música. Aceptas usar el sitio de forma lícita y no hacer un uso indebido ni interrumpirlo." },
          { heading: "Propiedad intelectual", body: "Todo el contenido de este sitio (textos, gráficos, logotipos e imágenes) es propiedad de Alondra Music Academy o de sus licenciantes y no puede reproducirse sin autorización." },
          { heading: "Responsabilidad", body: "Procuramos mantener la información precisa y actualizada, pero no garantizamos su exhaustividad. En la máxima medida permitida por la ley, Alondra no se responsabiliza por daños derivados del uso de este sitio." },
          { heading: "Ley aplicable", body: "Estas notas se rigen por las leyes del estado de Florida y la legislación federal de Estados Unidos aplicable, sin considerar principios de conflicto de leyes." },
        ],
      },
    },
    careers: {
      hero: {
        eyebrow: "Empleo",
        title: "Trabaja con nosotros",
        subtitle: "Ayuda a **estudiantes de todas las edades** a descubrir la alegría de la música. Si eres un **músico-educador apasionado y rigurosamente formado**, nos encantaría conocerte.",
      },
      whyTitle: "Por qué trabajar con Alondra",
      whyBody: "En Alondra estamos formando un claustro de **músicos-educadores excepcionales** que se preocupan tanto por sus estudiantes como por la música. Invertimos en nuestros profesores, cuidamos su tiempo y les damos el apoyo para dar lo mejor de sí, en una academia cálida, profesional y en crecimiento.",
      perks: [
        { title: "Una cultura que cuida", body: "Un equipo cercano y solidario que valora **la calidez, la paciencia y el oficio**." },
        { title: "Trabajo justo y flexible", body: "Horarios que respetan tu vida, **pago competitivo** y clases cerca de casa." },
        { title: "Crecimiento real", body: "**Formación continua, mentoría** y un camino claro para crecer con la academia." },
        { title: "Confianza y seguridad", body: "Un equipo rigurosamente verificado donde la **profesionalidad y la seguridad infantil** son lo primero." },
      ],
      positionsTitle: "Posiciones abiertas",
      positionsEmpty: "No hay posiciones abiertas por ahora",
      positionsEmptyBody: "En este momento no estamos contratando activamente, pero siempre nos alegra conocer buena gente. Déjanos una candidatura espontánea abajo y te contactaremos cuando se abra el puesto adecuado.",
      positions: [],
      formTitle: "Candidatura espontánea",
      formSubtitle: "Cuéntanos sobre ti y te tendremos en cuenta para futuras vacantes.",
      fields: {
        name: "Nombre completo",
        email: "Correo",
        phone: "Teléfono",
        role: "Instrumento / puesto de interés",
        link: "CV o portafolio (opcional)",
        cvHint: "Arrastra tu CV aquí o haz clic para elegir",
        cvRemove: "Quitar archivo",
        message: "Sobre ti",
        submit: "Enviar candidatura",
        terms: "Acepto los términos y condiciones del tratamiento de mis datos personales.",
      },
      sending: "Enviando…",
      errorSend: "No pudimos enviar tu candidatura. Inténtalo de nuevo o escríbenos a alondramusicacademy@gmail.com.",
      fileError: "El archivo debe ser PDF o Word y pesar menos de 5 MB.",
      successTitle: "¡Candidatura recibida!",
      successBody: "Gracias por tu interés en Alondra. Te contactaremos si se abre un puesto que encaje.",
      successAgain: "Enviar otra candidatura",
    },
  },
  fr: {
    meta: {
      home: { title: "Cours de Musique à Domicile à Miami | Alondra", description: "Cours de musique à domicile à Miami-Dade et Broward. Nous choisissons le professeur qui convient à votre enfant pour qu'il progresse avec plaisir." },
      programs: { title: "Cours de Musique à Miami : Piano, Violon, Chant et Guitare", description: "Piano, violon, chant, guitare, flûte et basse à domicile à Miami. Chaque cours intègre technique, rythme, lecture et interprétation." },
      teachers: { title: "Nos Professeurs de Musique à Miami | Alondra", description: "Ilena Peña et l'équipe d'Alondra : où chaque professeur s'est formé, quels instruments il enseigne et comment nous le choisissons." },
      about: { title: "À propos d'Alondra Music Academy | Cours à Domicile", description: "Comment Alondra enseigne : notre philosophie, les quatre dimensions de chaque cours et les vérifications, l'assurance et l'immatriculation." },
      registration: { title: "Tarifs des Cours de Musique à Miami | Alondra", description: "Cours de musique à domicile à Miami-Dade et Broward à partir de 50 $ le cours privé et 35 $ partagé, avec réductions par foyer et fréquence." },
      enroll: { title: "Inscription aux Cours de Musique à Miami | Alondra", description: "Comment se passe l'inscription chez Alondra : les trois étapes, l'accord mensuel, le préavis de 24 heures et le formulaire de réservation." },
      careers: { title: "Emplois de Professeur de Musique à Miami | Alondra", description: "Enseignez le piano, le chant, la guitare ou le violon avec Alondra. Nous cherchons des professeurs alliant formation musicale et vocation." },
      contact: { title: "Contacter Alondra Music Academy | Cours à Miami", description: "Vérifiez les disponibilités pour votre code postal et votre instrument ou réservez un appel gratuit de 15 minutes. À domicile à Miami-Dade et Broward." },
      privacy: { title: "Politique de confidentialité | Alondra Music Academy", description: "Comment Alondra Music Academy collecte, utilise et protège vos données personnelles." },
      cookies: { title: "Politique de cookies | Alondra Music Academy", description: "Comment Alondra Music Academy utilise les cookies, le stockage local et la mesure d'audience sur ce site." },
      legal: { title: "Mentions légales | Alondra Music Academy", description: "Conditions régissant l'utilisation du site web d'Alondra Music Academy." },
    },
    nav: { home: "Accueil", programs: "Formats", teachers: "Professeurs", about: "Académie", registration: "Tarifs", enroll: "Inscription", careers: "Travaillez avec nous", contact: "Contact" },
    hero: {
      eyebrow: "Miami-Dade · Broward",
      title1: "Offrez à votre enfant le superpouvoir de la musique.",
      title2: "Révélez son potentiel dès aujourd'hui.",
      subtitle:
        "**Le bon professeur fait toute la différence.** Nous choisissons pour votre enfant celui avec qui il s’entend le mieux, et des cours où il a envie de revenir, chez vous, dans tout Miami-Dade et Broward.",
      ctaPrimary: "Réservez votre appel gratuit de 15 min",
      ctaSecondary: "Voir les formats",
      stat1: "12+", stat1Label: "Années d'expérience",
      stat2: "500+", stat2Label: "Élèves formés par Ilena",
      stat3: "100%", stat3Label: "Professeurs vérifiés",
    },
    testimonials: {
      title: "Aimés par les familles du sud de la Floride",
      seeAll: "Voir tous sur Google",
      reviewsSuffix: "avis Google",
      translatedNote: "Traduit de la langue d'origine",
      readMore: "Lire l'avis en entier",
      readLess: "Afficher moins",
    },
    pedagogy: {
      eyebrow: "Notre Méthode",
      title: "La Méthode Alondra : quatre choses à chaque cours",
      body: "Chaque cours d’Alondra travaille les quatre mêmes dimensions, quel que soit l’instrument et quel que soit le niveau. Ce n’est pas un slogan : c’est ce que le professeur prépare avant d’arriver et ce qu’il revoit avant de partir. Le répertoire change avec chaque enfant, et les enfants finissent par réclamer les morceaux qu’ils aiment, ce qui est très bien ainsi. **Ce qui ne change pas, c’est ceci.**",
      pillars: [
        { title: "Technique", body: "Comment le son se produit : posture, mains, respiration, attaque. C’est ce qui permet de jouer ce qu’on sait déjà lire, et cela se corrige cours après cours, pas une seule fois au début." },
        { title: "Rythme", body: "La pulsation sous tout le reste : subdivision, lecture rythmique, jouer en mesure, et la tenir quand quelqu’un d’autre joue aussi." },
        { title: "Lecture musicale", body: "Lire la partition : notes, clés, chiffrage. Le but est que l’enfant aborde seul un morceau nouveau, sans avoir besoin de l’entendre avant." },
        { title: "Interprétation", body: "Lui donner du sens : nuances, phrasé, intention. C’est la différence entre jouer les bonnes notes et faire de la musique, et c’est ce qui s’entend lors d’un récital." },
      ],
    },
    instruments: {
      title: "Disciplines",
      subtitle: "La technique de la tradition du conservatoire, et les morceaux que votre enfant a vraiment envie de jouer.",
      cta: "Voir les sept disciplines",
    },
    formats: {
      eyebrow: "Façons d'apprendre",
      title: "Formats",
      subtitle: "Choisissez le format qui vous convient. Chaque option conserve la même rigueur pédagogique.",
      photoLabel: "Photo des formats",
      cta: "Voir les formats en détail",
    },
    teachers: {
      hero: { eyebrow: "Nos professeurs", title: "Rencontrez ceux qui enseigneront à votre enfant", subtitle: "Qui entre chez vous chaque semaine, où il s'est formé et comment Ilena choisit celui qui convient à votre enfant." },
      title: "Le professeur qui convient à votre enfant",
      subtitle: "**Ilena choisit personnellement** le professeur qui s’accorde le mieux avec chaque élève, au sein d’une équipe de professionnels **rigoureusement vérifiés**.",
      verified: "Professeur Vérifié",
      moreLink: "Découvrir {name}",
      teamTitle: "L’équipe qui enseigne",
      matchPromise: "Si votre enfant n’accroche pas avec son professeur, dites-le-nous : nous examinons la situation et cherchons une meilleure combinaison. Les cours déjà donnés sont dus et ne sont pas remboursés, mais la réaffectation n’entraîne pas de nouveaux frais d’inscription.",
      bios: { title: "Rencontrez notre équipe", subtitle: "Chaque professeur d'Alondra allie une formation de conservatoire à une véritable vocation d'enseignant. Découvrez leurs parcours." },
      vetting: { title: "Chaque professeur passe le filtre avant de frapper à votre porte", body: "Vérification d'antécédents, évaluation psychologique, audit technique et formation trimestrielle. Le processus complet, avec l'assurance et l'immatriculation qui le soutiennent, se trouve sur la page de l'académie.", cta: "Voir nos vérifications" },
      hiring: { title: "Vous êtes professeur de musique ?", body: "Nous lisons toujours les candidatures de professeurs qui allient une formation de conservatoire à une véritable vocation d'enseignant.", cta: "Travaillez avec nous" },
      director: {
        slug: "profe-ilena",
        name: "Ilena Peña Fernández",
        role: "Fondatrice et Directrice pédagogique · Professeure de violon, chant, piano et art sonore",
        photo: "/images/profe-ilena.webp",
        summary: "Rencontrez Ilena Peña Fernández, fondatrice et directrice d'Alondra Music Academy, violoniste, ingénieure du son et éducatrice forte de **plus de 12 ans d'expérience** dans l'enseignement musical, qui a également exercé comme musicothérapeute à une étape antérieure de sa carrière, avant que la certification professionnelle ne devienne obligatoire aux États-Unis. Tout au long de sa carrière, elle a consacré sa vie à former et inspirer enfants, jeunes et adultes, convaincue que la musique est un puissant outil pour développer **la créativité, la discipline, la confiance et l'épanouissement personnel**. Sa vocation pour l'enseignement et son exigence d'excellence font d'elle une professionnelle qui allie savoir, sensibilité et passion dans chaque cours.",
        bio: [
          "Rencontrez Ilena Peña Fernández, fondatrice et directrice d'Alondra Music Academy, violoniste, ingénieure du son et éducatrice forte de **plus de 12 ans d'expérience** dans l'enseignement musical, qui a également exercé comme musicothérapeute à une étape antérieure de sa carrière, avant que la certification professionnelle ne devienne obligatoire aux États-Unis. Tout au long de sa carrière, elle a consacré sa vie à former et inspirer enfants, jeunes et adultes, convaincue que la musique est un puissant outil pour développer **la créativité, la discipline, la confiance et l'épanouissement personnel**. Sa vocation pour l'enseignement et son exigence d'excellence font d'elle une professionnelle qui allie savoir, sensibilité et passion dans chaque cours.",
          "Diplômée de l'Université des Arts (ISA) de Cuba avec une licence en Musique et une spécialisation en Direction du son musical, et formée comme violoniste au prestigieux Conservatoire Esteban Salas, Ilena a bâti une carrière remarquable comme professeure de musique, de théâtre musical et musicothérapeute. Parallèlement, elle a mené une brillante carrière d'ingénieure du son dans des studios d'enregistrement et des productions musicales reconnus, travaillant avec de grands artistes et des projets de haut niveau. Cette expérience lui permet d'offrir un **enseignement complet** qui associe interprétation, technique, créativité et une profonde compréhension du processus artistique.",
          "En tant que fondatrice d'Alondra Music Academy, Ilena a créé une académie où **l'excellence académique et l'attention personnalisée** sont au cœur de chaque programme. Sa méthode s'adapte aux forces, aux besoins et aux objectifs de chaque élève, favorisant un apprentissage dynamique, motivant et significatif. Plus que d'apprendre à jouer d'un instrument, son but est d'éveiller l'amour de la musique, de former des musiciens sûrs d'eux et créatifs, et de donner à chaque élève les outils nécessaires pour **atteindre son plein potentiel**, sur scène comme en dehors. À Alondra, elle enseigne personnellement le violon, le chant, le piano et l'art sonore.",
        ],
      },
      team: [
        {
          slug: "profe-olivia",
          name: "Olivia García Rey",
          role: "Professeure de piano",
          photo: "/images/profe-olivia.webp",
          summary: "Pianiste et éducatrice forte de **plus de trois décennies d'expérience**, reconnue pour son approche humaine et personnalisée de la pédagogie du piano, qui a également exercé comme musicothérapeute à une étape antérieure de sa carrière.",
          bio: [
            "Rencontrez Olivia García Rey, pianiste et éducatrice de renom qui, à une étape antérieure de sa carrière, a exercé comme musicothérapeute, forte de **plus de trois décennies d'expérience** à former des musiciens et à cultiver le talent d'enfants, de jeunes et d'adultes. Sa solide formation dans de prestigieuses institutions musicales de Cuba, ainsi qu'une longue carrière de professeure en conservatoires et écoles d'art, font d'elle une maître d'un niveau exceptionnel, reconnue pour sa profonde maîtrise de la pédagogie du piano, de l'interprétation et de la formation complète du musicien.",
            "Tout au long de sa carrière, Olivia a guidé des centaines d'élèves, les aidant à développer non seulement une excellente technique pianistique, mais aussi **la discipline, la sensibilité artistique et la confiance en soi**. Son expérience de musicothérapeute lui a permis de comprendre l'impact de la musique sur le développement cognitif, émotionnel et social, enrichissant sa méthode d'une approche humaine, proche et **entièrement personnalisée**, adaptée aux forces, aux besoins et aux objectifs de chaque élève.",
            "À Alondra Music Academy, Olivia partage sa passion pour la musique avec l'engagement d'inspirer chaque élève à **atteindre son plein potentiel**. Ses cours offrent bien plus que l'apprentissage du piano : ils proposent une **formation artistique de grande qualité** qui favorise la créativité, l'expression musicale, l'épanouissement complet et un amour de la musique qui dure toute la vie.",
          ],
        },
        {
          slug: "profe-rafael",
          name: "Rafael Paseiro",
          role: "Professeur de guitare et de basse électrique",
          photo: "/images/profe-rafael.webp",
          summary: "Bassiste, compositeur et arrangeur fort de **plus de trois décennies de carrière internationale** ; à Alondra, il enseigne la guitare et la basse électrique.",
          bio: [
            "Rafael Paseiro est un bassiste, compositeur, arrangeur et professeur de guitare reconnu, fort de **plus de trois décennies d'expérience** musicale. **Diplômé avec mention** de l'École nationale d'art de Cuba sous la tutelle du prestigieux bassiste Carlos del Puerto, il a mené une carrière remarquable alliant interprétation, composition, arrangements musicaux et une profonde vocation d'enseignant.",
            "Comme interprète, compositeur et arrangeur, Rafael a collaboré à de nombreuses productions discographiques et partagé la scène avec des artistes de renom tels qu'Issac Delgado, Gonzalo Rubalcaba, Harold López-Nussa, Roberto Carcassés, Raúl Paz et The Temptations, parmi bien d'autres. Son talent l'a conduit à se produire dans certains des plus grands festivals de jazz du monde et à effectuer des tournées à travers les Amériques, l'Europe, l'Asie et les Caraïbes, s'imposant comme un musicien au **prestige international reconnu**.",
            "À Alondra Music Academy, Rafael met sa vaste expérience au service de la formation de la nouvelle génération de musiciens grâce à un enseignement personnalisé de la guitare et de la basse électrique. Sa méthode allie une **solide formation technique** au développement de la créativité, de l'expression musicale et de la confiance de chaque élève, inspirant enfants, jeunes et adultes à découvrir et atteindre leur plein potentiel artistique.",
          ],
        },
        {
          slug: "profe-claudia-nuevo",
          name: "Claudia Nuevo",
          role: "Professeure de piano et de flûte",
          photo: "/images/profe-claudia-nuevo.webp",
          summary: "Pianiste et flûtiste formée au Conservatoire Esteban Salas et à l'ISA ; elle propose des **cours dynamiques et personnalisés** centrés sur chaque élève.",
          bio: [
            "Rencontrez Claudia Nuevo, pianiste, flûtiste et éducatrice de talent, passionnée par l'idée d'inspirer ses élèves à travers la musique. Diplômée du prestigieux Conservatoire Esteban Salas et titulaire d'études en Production et Enregistrement musical à l'Université des Arts (ISA) de Cuba, elle allie une **solide formation académique** à une belle carrière d'interprète et de professeure.",
            "Tout au long de sa carrière, elle a enseigné le piano et la flûte dans des institutions musicales reconnues, tout en se produisant comme pianiste accompagnatrice et membre d'orchestres, de chœurs, d'ensembles et de formations professionnelles. Son expérience internationale et sa vocation d'enseignante lui permettent d'offrir des cours dynamiques, personnalisés et axés sur l'**épanouissement complet de chaque élève**.",
            "À Alondra Music Academy, Claudia crée un environnement où la technique, la créativité et l'expression musicale se développent naturellement. Son objectif est que chaque élève apprenne non seulement à jouer d'un instrument, mais **gagne en confiance**, prenne plaisir à apprendre et découvre une passion pour la musique qui l'accompagnera toute sa vie.",
          ],
        },
        {
          slug: "profe-claudia-rodriguez",
          name: "Claudia D. Rodríguez",
          role: "Professeure d'euphonium, de chant et de piano",
          photo: "/images/profe-claudia-rodriguez.webp",
          summary: "Euphoniumiste, chanteuse et éducatrice musicale spécialisée en **euphonium, tuba et musique de chambre**, avec une carrière internationale.",
          bio: [
            "Rencontrez Claudia D. Rodríguez, euphoniumiste, chanteuse et éducatrice musicale de talent, passionnée par la formation d'élèves alliant **excellence, créativité et amour de la musique**. Sa solide préparation académique et sa vaste expérience d'enseignante et d'interprète lui permettent d'offrir un enseignement dynamique et personnalisé, inspirant des **élèves de tous âges** à développer leur plein potentiel.",
            "Diplômée de l'Université des Arts (ISA) de Cuba avec une licence en Musique et une **spécialisation en Euphonium**, et formée au prestigieux Conservatoire Esteban Salas, Claudia a enseigné l'euphonium, le tuba, le piano et la musique de chambre dans des institutions musicales reconnues. Elle a également mené une belle carrière d'instrumentiste et de chanteuse, se produisant dans des orchestres d'harmonie, des chœurs professionnels et des ensembles internationaux, sur des scènes à Cuba comme à l'étranger.",
            "À Alondra Music Academy, Claudia crée un environnement d'apprentissage motivant où **la technique, l'expression artistique et la confiance** grandissent de pair. Son engagement : que chaque élève prenne plaisir à apprendre la musique, renforce ses compétences et découvre une passion qui l'accompagnera toute sa vie.",
          ],
        },
        {
          slug: "profe-mayda",
          name: "Mayda Placeres",
          role: "Professeure de piano",
          photo: "/images/profe-mayda.webp",
          summary: "Pianiste et professeure forte de **plus de trois décennies d’expérience** dans les conservatoires de Cuba et du Mexique, elle enseigne aujourd’hui le piano aux enfants à Miami.",
          bio: [
            "Mayda Placeres s’est formée à l’École nationale de musique de La Havane, où elle a obtenu son diplôme de musique avec une **spécialisation en piano**, puis a suivi un troisième cycle en patrimoine musical et historiographie de la musique à l’Universidad San Gerónimo de La Habana. Sa carrière d’enseignante a commencé dans cette même école, où elle a donné des cours de piano pendant **deux décennies**.",
            "Elle a ensuite enseigné au Conservatoire national de musique du Mexique, à Mexico, avant de s’installer dans le sud de la Floride, où elle enseigne le piano aux enfants depuis 2022. En trente ans et trois pays, son travail a associé une **maîtrise avancée du piano classique** à une connaissance approfondie de la théorie musicale et à une attention constante à ce qui fonctionne vraiment en cours : une technique claire, des méthodes d’enseignement efficaces et une relation proche avec chaque élève.",
            "À Alondra Music Academy, Mayda enseigne le piano aux enfants et aux adolescents. Ses cours posent des **bases techniques solides** sans perdre la motivation qui donne envie à un enfant de revenir à son instrument : l’équilibre qu’elle a affiné au fil d’une carrière menée dans les conservatoires et, surtout, face aux élèves.",
          ],
        },
      ],
    },
    coverage: {
      eyebrow: "Zone de service",
      title: "Miami-Dade & Broward",
      subtitle: "Nous apportons les cours **directement chez vous** dans tout le sud de la Floride.",
      citiesTitle: "Villes",
      citiesNote: "Votre ville n'apparaît pas ? Nous sommes ouverts à d'autres zones. Contactez-nous pour des **cours à domicile personnalisés**.",
      schedule: "Horaires",
      scheduleBody: "Cours à domicile dans toute la région de Miami, selon un **horaire adapté à votre vie**.",
      daysOpen: "Lundi – Samedi",
      hoursOpen: "8h – 20h",
      daysClosed: "Dimanche",
      hoursClosed: "Fermé",
      contactsTitle: "Contacts",
      mapUnavailable: "La carte n'a pas pu se charger pour le moment.",
      mapCta: "Ouvrir dans Google Maps",
      cities: ["Coral Gables", "Doral", "Flagami", "Westchester", "Sweetwater", "South Miami", "Dadeland", "Kendall", "Hialeah", "Miami Springs", "Miami Lakes"],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions fréquentes",
      items: [
        { q: "À quel âge peut-on commencer ?", a: "Nous accueillons les élèves dès 0 an via notre **programme de stimulation précoce** ; l'étude instrumentale formelle commence généralement à 4 ans, et il n'y a pas de limite d'âge, débutants adultes bienvenus." },
        { q: "Acceptez-vous les élèves adultes ?", a: "Oui. Les enfants sont notre public principal, mais nous enseignons aux **élèves de tous âges**. Il n'y a pas de limite d'âge pour commencer. Nous adaptons le répertoire et le rythme à chaque élève." },
        { q: "Venez-vous vraiment à domicile ?", a: "Oui, tous les cours sont **donnés chez vous** dans Miami-Dade et Broward." },
        { q: "Comment vérifiez-vous vos professeurs ?", a: "Chaque professeur passe une **vérification d'antécédents stricte** au niveau de l'État et fédéral (Background Check), une évaluation d'aptitude psychologique et un audit technique musical. Nous nous assurons que seuls des professionnels vérifiés, talentueux et dotés d'une profonde sensibilité humaine entrent **dans le confort de votre foyer**." },
        { q: "Quel instrument mon enfant doit-il choisir ?", a: "L'instrument idéal se choisit en équilibrant l'âge de votre enfant (maturité motrice) avec ses propres préférences et intérêts. Pour bien démarrer, nous offrons un **appel de découverte gratuit** où nous évaluons son profil et planifions son cours avec le spécialiste idéal, garantissant un début motivant et personnalisé dès le premier jour." },
        { q: "Combien de temps dure un cours ?", a: "Le format standard pour la plupart des instruments et le **programme de stimulation précoce** est de 45 minutes, portées à 60 minutes pour les niveaux avancés. Les séances de 30 minutes ne sont disponibles que lorsque plus de deux élèves s'inscrivent dans le même foyer, optimisant la dynamique familiale." },
        { q: "Fournissez-vous l'instrument ?", a: "Au début, oui : si vous avez besoin de quelques jours pour acheter le vôtre, nous apportons l'instrument au cours pour que votre enfant ne perde pas de temps. Mais c'est une solution temporaire, et nous recommandons d'en acheter un : **l'enfant a besoin d'un instrument à la maison pour travailler pendant la semaine**, et c'est ce travail entre les cours qui fait réellement progresser. Nous vous donnons un **guide d'achat et de configuration expert** pour choisir le bon, facilement et **en toute sécurité**." },
        { q: "Les frères et sœurs peuvent-ils partager un cours ?", a: "Oui, nous offrons des **remises fratrie** et des formats de cours partagé quand l'âge le permet." },
        { q: "Que faire si nous devons reprogrammer ?", a: "Si vous nous prévenez **plus de 24 heures à l'avance**, le cours est reprogrammé sans problème. Pour les annulations de dernière minute, la séance sera considérée comme donnée, sauf en cas d'urgences ou d'imprévus médicaux démontrables. De plus, en cas d'absences fréquentes au cours d'un même mois, 50 % des cours seront rattrapés pour préserver la continuité de votre enfant." },
        { q: "Y a-t-il des récitals ?", a: "Oui. Les **récitals saisonniers** font partie du programme de l'académie : ils sont l'occasion pour chaque élève de partager ses progrès avec sa famille et sa communauté. Les dates sont annoncées à l'avance aux familles inscrites." },
        { q: "Comment s'inscrire ?", a: "C'est très simple ! Cliquez sur notre bouton Contactez-nous pour nous écrire sur WhatsApp, ou remplissez le formulaire du site. En moins de 48 heures, nous organiserons votre **appel téléphonique de découverte gratuit** pour connaître votre enfant et lui attribuer le professeur spécialiste idéal." },
      ],
    },
    stepUp: {
      eyebrow: "Step Up For Students",
      title: "Si votre famille a des fonds Step Up, vous pouvez les utiliser ici",
      body: "Nous sommes **prestataire direct**, donc les cours sont payés par la bourse sans que vous ayez à avancer l’argent puis à le réclamer. Ce n’est pas le seul point : c’est sur les démarches que la plupart des familles se bloquent.",
      points: [
        { title: "Prestataire direct", body: "Les fonds vont à l’académie. Rien à avancer, aucun remboursement à attendre." },
        { title: "Nous aidons pour les démarches", body: "La partie qui prend un après-midi la première fois. Nous l’avons déjà faite et nous vous accompagnons." },
        { title: "En anglais, espagnol ou français", body: "Les démarches comprises. Si les formulaires ne sont pas dans votre langue, c’est là qu’on abandonne." },
        { title: "À domicile, comme toujours", body: "Utiliser la bourse ne change rien au déroulement du cours." },
      ],
      note: "Nous ne décidons pas qui est éligible : c’est Step Up qui le décide et ses critères évoluent. Ce que nous faisons, c’est rendre l’usage des fonds simple une fois que vous les avez.",
    },
    ctaBanner: {
      title: "Prêts à commencer votre voyage musical ?",
      body: "Réservez un **appel de découverte gratuit** et nous trouverons le professeur idéal pour votre enfant.",
      button: "Réservez votre appel gratuit de 15 min",
    },
    widget: {
      title: "Finalisez votre inscription",
      body: "Vous avez déjà eu votre appel de découverte ? Confirmez ici votre horaire hebdomadaire. Propulsé par My Music Staff.",
      placeholder: "Le widget d'inscription My Music Staff sera intégré ici.",
      loading: "Chargement du calendrier…",
      errorTitle: "Le calendrier ne s'est pas chargé",
      retry: "Réessayer",
      directHelp: "Vous préférez réserver directement ? Écrivez-nous sur WhatsApp ou par e-mail et nous organisons tout.",
    },
    notFound: { title: "Page introuvable", body: "Ce lien est rompu ou la page a été déplacée. Votre navigateur n'y est pour rien.", back: "Retour à l'accueil", requested: "Vous avez demandé", elsewhere: "Ou allez directement à" },
    skipToContent: "Aller au contenu",
    programs: {
      hero: {
        eyebrow: "Formats et instruments",
        title: "Un chemin pour chaque musicien",
        subtitle: "Sept disciplines, enseignées en trois formats, chaque parcours pensé pour votre enfant. Cliquez sur une discipline pour découvrir la méthode et comment les progrès se manifestent.",
      },
      offer: {
        theoryFree: "La théorie musicale est incluse gratuitement dans toutes les disciplines.",
        voiceException: "Le chant est la seule exception : les cours de théorie sont facturés séparément.",
        includesLabel: "Disciplines incluses",
        methodLabel: "La méthode",
        progressLabel: "La progression",
        shortTermLabel: "À court terme (1–3 mois)",
        longTermLabel: "À long terme",
      },
      disciplines: [
        { key: "piano", name: "Piano", tagline: "Deux mains, deux clés et toute l’harmonie sous les doigts.", focus: "Indépendance de chaque main, lecture simultanée en clé de sol et de fa, et un toucher régulier sur tout le clavier.", method: "Nous combinons la précision technique de l'école classique avec une approche de lecture agile et adaptée. Dès les premières leçons, l'enfant travaille l'**indépendance des deux mains** et la lecture simultanée en clés de sol et de fa.", progress: { short: "Posture correcte au clavier, reconnaissance des notes de musique et exécution de ses premières mélodies fluides à deux mains.", long: "Déchiffrer un morceau jamais entendu, et un répertoire qu’il peut jouer d’un bout à l’autre devant quelqu’un." } },
        { key: "violin", name: "Violon", tagline: "La justesse se construit par l’oreille et par le bras.", focus: "Tenue de l’archet et position de la main gauche, justesse sans repères, et contrôle de l’archet pour un son stable.", method: "Fondé sur la **discipline posturale et l'éducation de l'oreille**. Nous mettons en œuvre un système progressif qui privilégie la justesse et le placement de l'archet avant d'aborder des techniques complexes, tout en maintenant la motivation.", progress: { short: "Contrôle de l'archet, posture corporelle détendue, stabilité de la tenue de l'instrument et production d'un son clair.", long: "Une justesse nette dans les positions étudiées, un son tenu, et la capacité d’accorder son propre instrument." } },
        { key: "flute", name: "Flûte", tagline: "De l’air transformé en son.", focus: "Embouchure, soutien du souffle, articulation nette et phraser une ligne sans manquer d’air.", method: "Centré sur le contrôle de l'air et le phrasé élégant. Le programme allie la technique d'embouchure traditionnelle à une lecture rythmique stricte, de sorte que le **contrôle de la respiration** soutienne la phrase jusqu’au bout.", progress: { short: "Émission d'un son clair et soutenu, position correcte des mains et exécution de gammes et de mélodies initiales.", long: "Un son stable dans les registres étudiés, une articulation contrôlée et des phrases menées jusqu’au bout." } },
        { key: "guitar", name: "Guitare", tagline: "Accords, mélodie et accompagnement sur les mêmes six cordes.", focus: "Lecture de la partition et de la tablature, changements d’accords nets, et motifs de main droite pour accompagner.", method: "Un parcours polyvalent allant de la guitare classique à l'acoustique et au contemporain. L'élève apprend à lire les **partitions et les tablatures** en parallèle, combinant mélodies solistes et rythmique d'accompagnement.", progress: { short: "Force et agilité initiales des doigts, transitions nettes entre accords de base et exécution de rythmes simples.", long: "Accompagner une chanson d’un bout à l’autre, jouer une mélodie avec son propre doigté et lire une grille nouvelle." } },
        { key: "bass", name: "Basse électrique", tagline: "L’instrument qui tient un groupe ensemble.", focus: "Doigté des deux mains, jouer au métronome, et lire des lignes de basse et le chiffrage.", method: "Conçu pour explorer la basse comme un instrument individuel de grand caractère mélodique, sans négliger son rôle de **cœur rythmique d'un ensemble**. Il met l'accent sur la théorie harmonique appliquée, le tempo et le sens du groove.", progress: { short: "Synchronisation rythmique parfaite, technique de doigté des deux mains et exécution de lignes de basse fondamentales.", long: "Tenir le tempo sans métronome, construire une ligne sur une grille et se caler avec une batterie." } },
        { key: "voice", name: "Chant", tagline: "L’instrument qu’on porte avec soi.", focus: "Respiration diaphragmatique, émission saine pour l’anatomie de l’enfant, diction et justesse.", method: "Une approche d'entraînement vocal sain conçue spécifiquement pour l'anatomie de l'enfant. Nous intégrons des exercices ludiques de **respiration diaphragmatique**, de diction et de résonance, en veillant toujours à sa santé vocale.", progress: { short: "Justesse de base, **contrôle de la respiration** consciente et dépassement du trac initial.", long: "Une tessiture confortable utilisée sans forcer, une diction claire, et une chanson prête à être chantée devant du monde." } },
        { key: "soundArt", name: "L'art du son", tagline: "Faire de la musique avec un ordinateur.", focus: "Enregistrement, montage et bases du mixage, plus la théorie nécessaire pour arranger ce qu’on écrit.", method: "Un laboratoire créatif et interactif. Nous fusionnons les fondamentaux de la théorie musicale et de l'acoustique de base avec l'utilisation de **logiciels de production numérique**. L'élève apprend à structurer ses propres idées musicales et à comprendre comment le son voyage et se transforme.", progress: { short: "Compréhension de l'environnement numérique, création de ses premières séquences rythmiques et reconnaissance des fréquences et textures sonores de base.", long: "Un morceau terminé, enregistré, arrangé et mixé par l’élève du début à la fin." } },
      ],
      formats: [
        {
          key: "individual",
          label: "Individuel",
          tag: "Toutes les disciplines",
          title: "Cours individuels",
          body: "Un **enseignement en tête-à-tête** entièrement construit autour d'un seul élève : rythme, répertoire et objectifs ajustés cours après cours. Disponible pour toutes les disciplines, avec la théorie musicale incluse sans frais supplémentaires.",
          points: ["Un professeur dédié pour un seul élève.", "Programme et répertoire entièrement personnalisés.", "Théorie musicale incluse gratuitement, en sus pour le chant."],
        },
        {
          key: "pianoLab",
          label: "Laboratoire de piano",
          tag: "Piano · Petit groupe",
          title: "Laboratoire de piano",
          body: "Plusieurs élèves apprennent le piano dans la même salle en même temps, chacun à son propre clavier numérique premium, au casque. Le professeur passe d'une station à l'autre, offrant à chaque élève un **temps individuel dédié** pour affiner la technique et fixer de nouveaux objectifs. Personne n'est jamais freiné ni bousculé par le groupe.",
          points: ["Chaque élève à son propre clavier numérique premium, au casque.", "Le professeur tourne pour un **temps individuel dédié** à chaque station.", "Les progrès d'un cours privé dans un cadre social et stimulant."],
        },
        {
          key: "littleMozart",
          label: "Little Mozart",
          tag: "0 à 4 ans",
          title: "Little Mozart",
          body: "Un programme spécial de petite enfance conçu personnellement par notre fondatrice, Ilena Peña Fernández. Fondé sur les **méthodes Orff, Kodály et Suzuki**, il éveille la musicalité des tout-petits, de 0 à 4 ans, par l'exploration rythmique et vocale, le mouvement et le jeu.",
          points: ["Conçu personnellement par la fondatrice Ilena Peña Fernández.", "Fondé sur les **méthodes Orff, Kodály et Suzuki**, pour les 0 à 4 ans.", "Rythme, chant et un premier contact avec le piano, le violon et la guitare."],
        },
      ],
      journey: {
        eyebrow: "Ton voyage à travers notre académie",
        title: "De la première note à la maîtrise",
        subtitle: "Un parcours clair et structuré. Chaque étape se décrit par **ce que l’élève sait faire**, non par ce qu’on lui promet.",
        steps: [
          { title: "Connexion", body: "Un premier appel pour connaître l’âge, les goûts et les horaires de l’enfant avant de lui attribuer un instrument et un professeur." },
          { title: "Initiation", body: "Posture, premières notes et lecture de la portée : l’enfant joue de courtes pièces en lisant, non en imitant." },
          { title: "Évolution", body: "Des pièces plus longues, un tempo plus stable et les premières nuances. L’élève commence à préparer un morceau pour le jouer devant quelqu’un." },
          { title: "Autonomie", body: "Lire une partition nouvelle sans aide, garder un répertoire prêt et commencer à improviser sur ce qu’il connaît déjà." },
          { title: "Maîtrise", body: "Un répertoire joué d’un bout à l’autre, le déchiffrage, et la préparation qu’exige une audition ou une certification." },
        ],
      },
    },
    about: {
      hero: { eyebrow: "À propos", title: "Une formation musicale conçue pour transcender", subtitle: "Nous consolidons un standard éducatif de niveau international **dans le confort de votre foyer**. Nous nous consacrons à **cultiver le potentiel artistique** des jeunes élèves dans un cadre éthique rigoureux, alliant des méthodologies de classe mondiale à un accompagnement chaleureux, proche et transparent." },
      mission: {
        title: "Notre philosophie",
        blocks: [
          { heading: "Relier la science pédagogique à la sensibilité artistique", body: "Chaque cours intègre **technique, rythme, lecture et interprétation**, adaptés à la façon d'apprendre de chaque élève." },
          { heading: "Excellence pédagogique guidée par notre fondatrice", body: "Alondra Music Academy est dirigée personnellement par sa **directrice fondatrice**. Chaque séance est assurée exclusivement par des professionnels de la haute école classique, rigoureusement formés et aux **antécédents entièrement vérifiés** pour votre absolue tranquillité." },
        ],
      },
      teamLink: {
        title: "Rencontrez les professeurs",
        body: "Ilena choisit personnellement le professeur qui convient le mieux à chaque élève. Leur formation, leurs instruments et leurs biographies complètes ont leur propre page.",
        cta: "Voir les professeurs",
      },
      verification: {
        eyebrow: "Sécurité avant tout",
        title: "Comment nous vérifions chaque professeur",
        subtitle: "Parce que la confiance n'est pas optionnelle quand il s'agit de vos enfants.",
        steps: [
          { title: "Background Check", body: "Vérification exhaustive des **antécédents judiciaires et des registres fédéraux** via des prestataires certifiés aux États-Unis." },
          { title: "Évaluation psychologique", body: "Entretiens structurés examinant **l'intelligence émotionnelle, l'empathie** et la communication pédagogique avec les mineurs." },
          { title: "Certification technique", body: "Auditions d'aptitude et **démonstrations pédagogiques en direct**, strictement évaluées par notre direction académique." },
          { title: "Formation continue", body: "Formation trimestrielle obligatoire sur le développement de l'enfant, la pratique pédagogique et les **protocoles avancés de protection des mineurs**." },
        ],
        compliance: {
          title: "En règle et entièrement assurés",
          items: [
            { label: "Vérifiés Niveau 2 (FDLE)", body: "Chaque professeur a passé la prise d'empreintes et la **vérification de Niveau 2** du Département de l'application de la loi de Floride." },
            { label: "Assurance de 1 M$", body: "Une **police de responsabilité civile de 1 000 000 $** (CPH Insurance) soutient chaque cours que nous donnons." },
            { label: "LLC enregistrée en Floride", body: "Alondra est une **société à responsabilité limitée (LLC) enregistrée et active** dans l'État de Floride." },
          ],
        },
      },
    },
    registration: {
      hero: { eyebrow: "Tarifs", title: "Ce que coûte un cours", subtitle: "Deux formats, tous les deux à domicile dans Miami-Dade et Broward. Réductions par foyer et par fréquence dès le deuxième membre." },
      enrollCta: "S'inscrire maintenant",
      enrollQualifier: "Vous avez déjà fait votre appel ?",
      pricingTitle: "Des tarifs transparents, sans surprises",
      pricingSubtitle: "**Sans contrats forcés ni frais cachés**. Choisissez le format idéal pour les objectifs et le rythme d'apprentissage de votre enfant.",
      priceFrom: "à partir de",
      priceLabel: "/ cours",
      formats: [
        { name: "Cours privé", description: "Approche individualisée et **entièrement personnalisée** selon les objectifs spécifiques de l'élève.", price: "$50", points: ["Un professeur dédié à 100 %", "Programme d'étude à votre propre rythme"] },
        { name: "Cours partagé", description: "Format de haut niveau dispensé en **petits groupes de 3 à 6 élèves**.", price: "$35", points: ["Socialisation et motivation mutuelle", "Instruction technique individualisée"] },
      ],
      lessonLengthTitle: "Combien de temps dure un cours",
      lessonLength: "45 minutes est le format standard pour la plupart des instruments et pour le **programme de stimulation précoce**, et 60 minutes pour les niveaux avancés. Les séances de 30 minutes uniquement lorsque plus de deux élèves s'inscrivent dans le même foyer.",
      benefits: {
        title: "Plus de musique, plus d'économies",
        subtitle: "Nous récompensons la régularité de votre foyer par des **avantages compétitifs** appliqués automatiquement à votre facturation mensuelle Stripe :",
        items: [
          { title: "Réduction multi-familiale", body: "Obtenez une **réduction spéciale de 10 %** sur votre abonnement mensuel dès le deuxième membre du foyer inscrit." },
          { title: "Réduction par fréquence", body: "Bénéficiez d'un **tarif préférentiel par cours** en programmant deux cours hebdomadaires ou plus par élève." },
        ],
      },
      note: "Le tarif final est confirmé lorsque vous nous contactez, selon **la durée et la fréquence**.",
    },
    enroll: {
      hero: { eyebrow: "Inscription", title: "Inscription et enregistrement", subtitle: "Tout ce qu'il faut pour rejoindre Alondra : les trois étapes, notre accord simple et le formulaire qui **réserve votre créneau hebdomadaire**." },
      stepsTitle: "Le chemin le plus simple pour commencer",
      stepsSubtitle: "Nous avons conçu un **processus agile et transparent** pour que votre famille commence son voyage musical sans complications et **en toute sécurité**.",
      steps: [
        { title: "Contactez-nous", body: "Écrivez-nous par WhatsApp ou remplissez notre formulaire en ligne. Nous évaluons le profil de votre enfant et attribuons l'instructrice idéale **en moins de 48 heures**." },
        { title: "Signez l'accord", body: "Recevez sous forme numérique notre accord transparent de politiques d'étude, conçu pour établir des attentes claires et **protéger votre famille**." },
        { title: "Réservez votre place", body: "Confirmez votre horaire hebdomadaire récurrent et c'est prêt ! Les cours de haut niveau commencent directement dans le **confort et la sécurité de votre foyer**." },
      ],
      contract: {
        title: "Transparence totale, sans contrats à long terme",
        body: "Notre accord est conçu selon les normes des États-Unis pour vous offrir une **clarté totale et une tranquillité d'esprit** dès le premier jour :",
        points: [
          { label: "Abonnement mensuel fixe", body: "**Paiements automatisés via Stripe** (Auto-Pay) le 1er de chaque mois." },
          { label: "Préavis obligatoire de 24h", body: "**Report flexible** en signalant vos absences 24 heures à l'avance." },
          { label: "Résiliation flexible de 15 jours", body: "**Annulez ou suspendez votre service** en prévenant 15 jours avant le début du mois suivant." },
          { label: "Environnement sûr à la maison", body: "Nous exigeons la **présence physique d'un adulte** au domicile pendant toute la leçon." },
        ],
      },
    },
    contact: {
      hero: { eyebrow: "Contact & Zones", title: "Nous venons chez vous", subtitle: "Nous servons les élèves à Miami-Dade et Broward avec **chaleur et précision**." },
      citiesTitle: "Villes desservies",
      citiesBody: "De Coral Gables et Doral à Kendall, Hialeah et au-delà, Alondra Music Academy apporte des **cours privés premium** **directement chez vous** dans toute la région de Miami. Votre ville n'apparaît pas ? Contactez-nous pour une solution sur mesure.",
      mapTitle: "Carte de couverture",
      formTitle: "Contactez-nous",
      formSubtitle: "Dites-nous pour qui sont les cours. Nous répondons sous 24 heures.",
      fields: {
        name: "Nom complet", student: "Prénom ou initiale de l’élève", age: "Âge de l’élève",
        email: "E-mail", phone: "Téléphone", zip: "Code postal",
        instrument: "Instrument souhaité", channel: "Comment préférez-vous qu’on vous réponde ?",
        source: "Comment avez-vous connu Alondra ?", availability: "Disponibilités approximatives",
        message: "Autre chose à nous signaler ?",
        choose: "Choisissez une option",
        submit: "Envoyer le message",
        terms: "J’accepte les conditions de traitement de mes données personnelles.",
        promo: "Je souhaite aussi recevoir les actualités de l’académie par e-mail. (Facultatif)",
      },
      channelOptions: ["WhatsApp", "Appel téléphonique", "E-mail"],
      sourceOptions: ["Nextdoor", "Recherche Google", "Instagram ou Facebook", "Une famille me l’a recommandée", "Ailleurs"],
      sending: "Envoi…",
      errorSend: "Nous n'avons pas pu envoyer votre message. Réessayez ou écrivez-nous à alondramusicacademy@gmail.com.",
      successTitle: "Merci !",
      successBody: "Nous avons reçu votre message et répondrons sous 24 heures.",
      successAgain: "Envoyer un autre message",
      infoTitle: "Contact direct",
      infoEmail: "alondramusicacademy@gmail.com",
      infoPhone: "+1 (786) 843-1028",
      infoHours: "Horaires client",
      infoHoursValue: "Lun–Sam · 8h – 20h · Dim fermé",
    },
    footer: {
      tagline: "**Une connexion qui inspire. Des progrès qui s’entendent.** Cours de musique à domicile à Miami-Dade et Broward.",
      columns: [
        { title: "Académie", links: [{ label: "Accueil", page: "home" }, { label: "Formats", page: "programs" }, { label: "Professeurs", page: "teachers" }, { label: "Académie", page: "about" }] },
        { title: "Inscription", links: [{ label: "Tarifs", page: "registration" }, { label: "Inscription", page: "enroll" }, { label: "Contact", page: "contact" }, { label: "Travaillez avec nous", page: "careers" }] },
      ],
      contact: "Contact",
      rights: "Tous droits réservés.",
      privacy: "Confidentialité",
      terms: "Conditions",
    },
    errors: { required: "Ce champ est requis", email: "Entrez un email valide", phone: "Entrez un téléphone valide", zip: "Saisissez un code postal à 5 chiffres" },
    legal: {
      eyebrow: "Légal",
      updated: "Dernière mise à jour : 20 juillet 2026",
      footerHeading: "Légalité",
      links: { privacy: "Politique de confidentialité", cookies: "Politique de cookies", notice: "Mentions légales" },
      privacy: {
        title: "Politique de confidentialité",
        intro:
          "Cette Politique de confidentialité explique comment Alondra Music Academy (« Alondra », « nous ») collecte, utilise et protège les données personnelles des familles et des visiteurs. Alondra opère depuis la Floride, aux États-Unis, et cette politique est rédigée conformément au droit américain.",
        sections: [
          { heading: "Informations que nous collectons", body: "Nous collectons les informations que vous choisissez de nous donner : via notre formulaire de contact (nom, e-mail, téléphone, ville et message) ; via notre formulaire de candidature (nom, e-mail, téléphone, le poste visé, votre message et le CV que vous joignez) ; et les informations sur l'élève qu'un parent ou tuteur fournit lors de l'inscription. Nous recevons aussi des données techniques de base (appareil, navigateur, adresse IP) recueillies automatiquement lors de votre navigation, par les services tiers intégrés et par Google Analytics, que nous utilisons pour mesurer l'audience du site de façon agrégée." },
          { heading: "Comment nous utilisons vos informations", body: "Nous utilisons vos informations pour répondre aux demandes, planifier et dispenser les cours, traiter les inscriptions, examiner les candidatures et communiquer avec vous. Nous ne vendons pas vos données personnelles et ne les partageons pas à des fins de publicité comportementale intercontextuelle." },
          { heading: "Prestataires et tiers", body: "Nous partageons des informations uniquement avec les prestataires qui nous aident à faire fonctionner l'académie : My Music Staff (notre outil intégré de planification et d'inscription) ; Google (Gmail traite et distribue les messages envoyés via nos formulaires, et Google Maps affiche notre carte de couverture) ; et WhatsApp/Meta, si vous choisissez de nous contacter par WhatsApp. Chacun dispose de sa propre politique de confidentialité. Les CV que vous envoyez nous parviennent par e-mail et ne sont pas stockés sur notre serveur. Nous pouvons également divulguer des informations lorsque la loi l'exige." },
          { heading: "Vie privée des mineurs", body: "Ce site s'adresse aux parents et tuteurs, non aux enfants. Nous ne collectons pas sciemment de données personnelles directement auprès d'enfants de moins de 13 ans ; toute information sur un élève est fournie par un parent ou tuteur, qui consent au nom de l'enfant. Si vous pensez qu'un enfant nous a communiqué des données personnelles, contactez-nous et nous les supprimerons." },
          { heading: "Vos droits en matière de vie privée", body: "Selon votre lieu de résidence, vous pouvez avoir le droit d'accéder à vos données personnelles, de les corriger, de les supprimer ou d'en obtenir une copie, et de refuser la vente de vos données ou la publicité ciblée (que nous ne pratiquons ni l'une ni l'autre). Les résidents de Floride disposent de ces droits en vertu du Florida Digital Bill of Rights, et ceux de Californie en vertu du CCPA/CPRA ; les résidents d'autres États peuvent avoir des droits similaires. Nous n'exercerons aucune discrimination à votre égard si vous les exercez. Pour faire une demande, écrivez-nous à l'adresse ci-dessous." },
          { heading: "Conservation et sécurité", body: "Nous conservons les données personnelles uniquement le temps nécessaire aux finalités décrites (les envois de formulaires nous parviennent sous forme d'e-mails gérés via Gmail) et appliquons des mesures de protection raisonnables. Aucune méthode de transmission sur internet n'est totalement sécurisée." },
          { heading: "Contact", body: "Des questions sur cette politique ? Écrivez-nous à alondramusicacademy@gmail.com ou appelez le +1 (786) 843-1028." },
        ],
      },
      cookies: {
        title: "Politique de cookies",
        intro:
          "Cette Politique de cookies décrit comment Alondra Music Academy utilise les cookies et technologies similaires sur notre site web. Alondra opère depuis la Floride, aux États-Unis.",
        sections: [
          { heading: "Que sont les cookies et technologies similaires", body: "Les cookies sont de petits fichiers texte stockés sur votre appareil qui aident les sites à fonctionner et à mémoriser des préférences. Nous utilisons aussi le stockage local (local storage) de votre navigateur dans le même but, par exemple pour mémoriser la langue ou le thème choisi." },
          { heading: "Comment nous les utilisons", body: "Nous utilisons un stockage fonctionnel et des outils de mesure d'audience. Nous enregistrons localement dans votre navigateur (local storage) votre langue et votre préférence de thème clair/sombre afin que le site reste tel que vous l'avez laissé. Nous utilisons aussi Google Analytics, qui dépose des cookies pour mesurer l'utilisation du site. Nous n'utilisons pas de cookies publicitaires et ces cookies ne servent pas à vous identifier personnellement." },
          { heading: "Cookies tiers", body: "Certaines fonctionnalités reposent sur des services tiers intégrés (notre planificateur My Music Staff et la carte de couverture Google Maps) qui peuvent déposer leurs propres cookies, soumis à leurs politiques de confidentialité respectives. Google Analytics dépose également ses propres cookies, régis par la politique de confidentialité de Google. Vous pouvez désactiver Google Analytics sur tous les sites via le module complémentaire de désactivation proposé par Google." },
          { heading: "Gérer les cookies et le stockage local", body: "Vous pouvez contrôler ou supprimer les cookies et le stockage local via les paramètres de votre navigateur. Les effacer peut réinitialiser vos préférences enregistrées, comme la langue ou le thème." },
          { heading: "Contact", body: "Des questions sur notre usage des cookies ? Écrivez-nous à alondramusicacademy@gmail.com." },
        ],
      },
      notice: {
        title: "Mentions légales",
        intro:
          "Ces Mentions légales définissent les conditions régissant votre utilisation du site web d'Alondra Music Academy. Alondra opère depuis la Floride, aux États-Unis.",
        sections: [
          { heading: "Éditeur du site", body: "Ce site est exploité par Alondra Music Academy, basée en Floride, aux États-Unis. Contact : alondramusicacademy@gmail.com · +1 (786) 843-1028." },
          { heading: "Utilisation du site", body: "Le contenu de ce site est fourni à titre d'information générale sur nos cours et services de musique. Vous acceptez d'utiliser le site de manière licite et de ne pas en faire un usage abusif ni le perturber." },
          { heading: "Propriété intellectuelle", body: "Tout le contenu de ce site (textes, graphiques, logos et images) est la propriété d'Alondra Music Academy ou de ses concédants et ne peut être reproduit sans autorisation." },
          { heading: "Avertissement et responsabilité", body: "Nous nous efforçons de maintenir des informations exactes et à jour, mais ne garantissons pas leur exhaustivité. Dans toute la mesure permise par la loi, Alondra n'est pas responsable des dommages résultant de l'utilisation de ce site." },
          { heading: "Droit applicable", body: "Ces mentions sont régies par les lois de l'État de Floride et par le droit fédéral américain applicable, sans égard aux principes de conflit de lois." },
        ],
      },
    },
    careers: {
      hero: {
        eyebrow: "Carrières",
        title: "Travaillez avec nous",
        subtitle: "Aidez les élèves de tout âge à découvrir la joie de la musique. Si vous êtes un **musicien-éducateur passionné et rigoureusement formé**, nous aimerions vous rencontrer.",
      },
      whyTitle: "Pourquoi travailler avec Alondra",
      whyBody: "Chez Alondra, nous constituons une équipe de **musiciens-éducateurs d'exception** qui se soucient autant de leurs élèves que de la musique. Nous investissons dans nos professeurs, protégeons leur temps et leur donnons le soutien nécessaire pour donner le meilleur d'eux-mêmes, dans une académie chaleureuse, professionnelle et en pleine croissance.",
      perks: [
        { title: "Une culture bienveillante", body: "Une équipe soudée et solidaire qui valorise **la chaleur, la patience et le métier**." },
        { title: "Un travail juste et flexible", body: "Des horaires qui respectent votre vie, une **rémunération compétitive** et des cours près de chez vous." },
        { title: "Une vraie évolution", body: "**Formation continue, mentorat** et un chemin clair pour grandir avec l'académie." },
        { title: "Confiance et sécurité", body: "Une équipe rigoureusement vérifiée où le **professionnalisme et la sécurité des enfants** priment." },
      ],
      positionsTitle: "Postes ouverts",
      positionsEmpty: "Aucun poste ouvert pour le moment",
      positionsEmptyBody: "Nous ne recrutons pas activement en ce moment, mais nous sommes toujours ravis de rencontrer des personnes talentueuses. Envoyez-nous une candidature spontanée ci-dessous et nous vous contacterons dès qu'un poste correspondant s'ouvrira.",
      positions: [],
      formTitle: "Candidature spontanée",
      formSubtitle: "Parlez-nous de vous et nous vous garderons à l'esprit pour de futurs postes.",
      fields: {
        name: "Nom complet",
        email: "Email",
        phone: "Téléphone",
        role: "Instrument / poste souhaité",
        link: "CV ou portfolio (optionnel)",
        cvHint: "Glissez votre CV ici ou cliquez pour choisir",
        cvRemove: "Retirer le fichier",
        message: "À propos de vous",
        submit: "Envoyer la candidature",
        terms: "J'accepte les conditions de traitement de mes données personnelles.",
      },
      sending: "Envoi…",
      errorSend: "Nous n'avons pas pu envoyer votre candidature. Réessayez ou écrivez-nous à alondramusicacademy@gmail.com.",
      fileError: "Le fichier doit être un PDF ou Word de moins de 5 Mo.",
      successTitle: "Candidature reçue !",
      successBody: "Merci de votre intérêt pour Alondra. Nous vous contacterons si un poste correspondant s'ouvre.",
      successAgain: "Envoyer une autre candidature",
    },
  },
};
