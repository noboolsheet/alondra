// Google Business reviews shown on the home page.
//
// These are REAL customer reviews. Each one is stored in the language the person
// actually wrote it (`originalLang`) plus a faithful translation into the other two,
// so a visitor always reads them in the language they're browsing the site in. The
// card shows a small "translated" note whenever the text on screen is not the original.
//
//   • googleProfileUrl  → the "See all on Google" button target
//   • googleRating      → average star rating (shown in the summary)
//   • googleReviewCount → total number of Google reviews on the profile
//   • googleReviews     → the individual reviews to feature (keep 3–6)
//
// Only feature reviews from actual families. Anyone with another relationship to the
// academy (teachers, collaborators, relatives) must not appear here: a testimonial has
// to disclose any such relationship, and the simplest way to comply is to leave it out.

import type { Lang } from "@/i18n/translations";

export interface GoogleReview {
  author: string;
  rating: number; // 1–5
  /** Language the review was originally written in. */
  originalLang: Lang;
  /** Review body per site language. `text[originalLang]` is the verbatim original. */
  text: Record<Lang, string>;
  date?: string; // e.g. "2 months ago"
  initial?: string; // optional avatar letter; defaults to author's first letter
}

export const googleProfileUrl = "https://www.google.com/search?client=mobilesearchapp&sca_esv=e1870cce4b49432d&channel=iss&cs=0&hl=es_419&rlz=1MDAPLA___US1103US1103&v=424.4.924152415&sxsrf=APpeQnuTEsNcBSzb3mvoWgPtK0TO8ReNpQ:1783101531406&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_xXwVMoXK98licszObE84D4hKgV87aJ0M_Ha46_zO0bEOaxojWfDFHcLszlN8UTfcN6nnHcQTpqAO0OgOsW3a_E7tPPDfLpW6ejaMTYZV3-k1S-_LFp9DOJDKvGKzqbKvcqbEtY%3D&q=Alondra+Music+Academy+-+In+Home+Music+Lessons+Opiniones&sa=X&ved=2ahUKEwiOx4LrireVAxUd_7sIHeQ5GoMQ0bkNegQIJhAF&biw=1536&bih=730&dpr=1.25";

export const googleRating = 5.0;
export const googleReviewCount = 18;

export const googleReviews: GoogleReview[] = [
  {
    author: "Yanet Fernández Méndez",
    rating: 5,
    originalLang: "es",
    text: {
      es: "Excelentes opciones para el aprendizaje y excelentes profesionales a cargo. El éxito está garantizado. Recomiendo esta academia 100 % porque cada detalle está cuidadosamente pensado.",
      en: "Excellent learning options and excellent professionals in charge. Success is guaranteed. I recommend this academy 100% because every detail is carefully thought through.",
      fr: "D'excellentes options d'apprentissage et d'excellents professionnels aux commandes. La réussite est garantie. Je recommande cette académie à 100 % car chaque détail est soigneusement pensé.",
    },
  },
  {
    author: "Linda Lindita",
    rating: 5,
    originalLang: "es",
    text: {
      es: "Excelente maestra tiene un don natural para los niños y los sabe tratar según edad y necesidades ; muy responsable y carińosa siempre atenta a cambios para poder brindar el servicio con calidad a los niños; y la comucacion con padres y terapistas es muy buena también ,se preocupa para que fluya bien y estemos todos en la misma página respecto a las metas del niñ@",
      en: "An excellent teacher: she has a natural gift with children and knows how to work with them according to their age and needs. Very responsible and caring, always attentive to changes so she can give the children a quality service. Communication with parents and therapists is very good too; she makes sure everything flows well and that we are all on the same page about the child's goals.",
      fr: "Une excellente enseignante : elle a un don naturel avec les enfants et sait s'adapter à leur âge et à leurs besoins. Très responsable et affectueuse, toujours attentive aux changements afin d'offrir un service de qualité aux enfants. La communication avec les parents et les thérapeutes est elle aussi très bonne ; elle veille à ce que tout se passe bien et à ce que nous soyons tous d'accord sur les objectifs de l'enfant.",
    },
  },
  {
    author: "Yuri Perez",
    rating: 5,
    originalLang: "en",
    text: {
      en: "Our five-year-old daughter has been a piano student of Ilena for approximately a year and a half, and what a wonderful experience that has been! Ilena's dedication, patience, and talent are unmatchable. Our daughter loves her time with her and literally counts the days to her next lesson. Since the beginning, we have noticed a consistent growth of our daughter's skills, and we look forward to a long-term teacher-student relationship between them.",
      es: "Nuestra hija de cinco años lleva aproximadamente un año y medio como alumna de piano de Ilena, ¡y qué experiencia tan maravillosa ha sido! La dedicación, la paciencia y el talento de Ilena son inigualables. Nuestra hija adora el tiempo que pasa con ella y literalmente cuenta los días para su próxima clase. Desde el principio hemos notado un crecimiento constante en sus habilidades, y esperamos que la relación entre maestra y alumna dure mucho tiempo.",
      fr: "Notre fille de cinq ans est élève de piano d'Ilena depuis environ un an et demi, et quelle merveilleuse expérience ! Le dévouement, la patience et le talent d'Ilena sont inégalables. Notre fille adore les moments passés avec elle et compte littéralement les jours jusqu'à son prochain cours. Depuis le début, nous avons constaté une progression constante de ses compétences, et nous espérons que cette relation entre professeure et élève durera longtemps.",
    },
  },
  {
    author: "Susana Montero",
    rating: 5,
    originalLang: "en",
    text: {
      en: "We are so happy with her as a piano teacher. My daughter absolutely loves her and always leaves class excited and motivated. She has such a special way of teaching, with so much patience and kindness. We've seen amazing progress, but what I love most is how much my daughter enjoys learning piano. I highly recommend her!",
      es: "Estamos muy contentos con ella como profesora de piano. Mi hija la adora y siempre sale de la clase entusiasmada y motivada. Tiene una manera muy especial de enseñar, con muchísima paciencia y cariño. Hemos visto un progreso increíble, pero lo que más me gusta es lo mucho que mi hija disfruta aprendiendo piano. ¡La recomiendo muchísimo!",
      fr: "Nous sommes très heureux de l'avoir comme professeure de piano. Ma fille l'adore et sort toujours du cours enthousiaste et motivée. Elle a une façon d'enseigner vraiment particulière, avec beaucoup de patience et de gentillesse. Nous avons constaté des progrès formidables, mais ce que j'apprécie le plus, c'est à quel point ma fille prend plaisir à apprendre le piano. Je la recommande vivement !",
    },
  },
  {
    author: "Maria Fernanda Artigas Herold",
    rating: 5,
    originalLang: "es",
    // Dice en su propio texto que conoce a Ilena desde siempre. Esa es justo
    // la relación que la FTC exige revelar, y va revelada dentro de la reseña,
    // así que se publica tal cual y sin nota añadida.
    text: {
      es: "Cuando yo estudiaba en la Escuela de Arte el violín, tenía que dar clases de piano como instrumento complementario. Tuve varios profesores, no porque no me sintiera bien con ellos, sino por organización administrativa de la escuela. Durante años, los profesores que me enseñaban el piano me decían que aprendiera lo justo, lo que me hacía falta para pasar los exámenes de fin de curso si, total, como el piano era el instrumento complementario, el examen no iba a ser igual de riguroso que si fuera el instrumento principal. Solo una profe, en todos los años que estuve en la escuela, me dijo: Tú estudias para aprender a tocar piano, no para pasar un examen. Y yo te voy a enseñar a tocar bien el piano. No hace falta decir que al final, ese fue el año que mejor nota saqué en mi examen. Yo conozco a Ilena desde siempre y ella es ese tipo de profesora. Enseña a sus estudiantes con amor, paciencia y dedicación, y no porque haya que cumplir los estándares de nadie, sino que enseña siempre a hacer las cosas bien, desde el principio, y para sí mismos. Sin importar el objetivo final que los estudios tengan.",
      en: "When I was studying violin at the School of Arts, I had to take piano lessons as a secondary instrument. I had several teachers, not because I did not get along with them, but because of how the school organised things. For years, the teachers who taught me piano told me to learn just enough, only what I needed to pass the end-of-year exams, since piano was the secondary instrument and the exam was never going to be as demanding as it would have been for the main one. Only one teacher, in all the years I spent at that school, said to me: you study to learn to play the piano, not to pass an exam. And I am going to teach you to play the piano properly. Needless to say, that turned out to be the year I got my best exam mark. I have known Ilena all my life and she is that kind of teacher. She teaches her students with love, patience and dedication, and not because anybody's standards have to be met, but so that they always learn to do things well, from the start, and for themselves. Whatever the final goal of their studies may be.",
      fr: "Quand j'étudiais le violon à l'École des arts, je devais prendre des cours de piano comme instrument complémentaire. J'ai eu plusieurs professeurs, non pas parce que je ne m'entendais pas avec eux, mais à cause de l'organisation administrative de l'école. Pendant des années, les professeurs qui m'enseignaient le piano me disaient d'apprendre le strict nécessaire, juste ce qu'il fallait pour passer les examens de fin d'année, puisque le piano était l'instrument complémentaire et que l'examen ne serait jamais aussi exigeant que pour l'instrument principal. Une seule professeure, en toutes ces années passées à l'école, m'a dit : tu étudies pour apprendre à jouer du piano, pas pour réussir un examen. Et je vais t'apprendre à bien jouer du piano. Inutile de préciser que ce fut l'année où j'ai obtenu ma meilleure note à l'examen. Je connais Ilena depuis toujours et elle est ce genre de professeure. Elle enseigne à ses élèves avec amour, patience et dévouement, non pas parce qu'il faut satisfaire les standards de qui que ce soit, mais pour qu'ils apprennent toujours à bien faire les choses, dès le début, et pour eux-mêmes. Quel que soit le but final de leurs études.",
    },
  },
];
