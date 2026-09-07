export type NoteField = "Combinatorics" | "Linear Algebra";

export type NoteBodyKey =
  | "kolam-investigation"
  | "row-reduction-exposition";

export type Audience = "General" | "Undergraduate" | "Graduate";

export type ProjectStatus = "Active now" | "Available";

export type Technology = "JavaScript" | "Python" | "R" | "Sage";

export interface VisualAccent {
  color: string;
  wash: string;
  ink: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: readonly string[];
  formula?: string;
  callout?: string;
  figureCaption?: string;
}

export interface MscClassification {
  code: string;
  label: string;
  role: "Primary" | "Secondary";
}

export type NoteResource =
  | {
      kind: "PDF";
      label: string;
      href: string;
      pages?: number;
      embed?: boolean;
    }
  | {
      kind: "Article" | "Interactive";
      label: string;
      href: string;
    };

export interface Article {
  id: string;
  key: string;
  articleType: string;
  slug: string;
  sourceHref: string;
  title: string;
  subtitle: string;
  published: string;
  modified?: string;
  displayDate: string;
  date: string;
  glimpse: string;
  tags: readonly string[];
  audience: readonly Audience[];
  keywords: readonly string[];
  msc: readonly MscClassification[];
  citationKey: string;
  readingMinutes: number;
  readingTime: string;
  accent: string;
  palette: VisualAccent;
  artLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  interactiveHref?: string;
  featured?: boolean;
  draft?: boolean;
  contents: readonly string[];
  sections: readonly ArticleSection[];
  closing?: string;
}

export interface Note {
  id: string;
  bodyKey: NoteBodyKey;
  slug: string;
  sourceHref: string;
  title: string;
  subtitle?: string;
  field: NoteField;
  topics: readonly string[];
  kind:
    | "Course resource"
    | "Lecture review"
    | "Worksheet"
    | "Handout"
    | "Workshop notes"
    | "Expository note";
  level: readonly Audience[];
  audience: string;
  format: "Online resource" | "PDF" | "Article + PDF";
  publishedAt: string;
  published: string;
  revisedAt: string;
  revised: string;
  displayRevision: string;
  abstract: string;
  estimatedTime?: string;
  prerequisites?: readonly string[];
  keywords?: readonly string[];
  msc?: readonly MscClassification[];
  citationKey?: string;
  citationSeries?: string;
  proofStatus?: string;
  showCaution?: boolean;
  showOnHomepage: boolean;
  resources: readonly NoteResource[];
  imageSrc?: string;
  imageAlt?: string;
  contents: readonly string[];
  learningGoals: readonly string[];
  sampleText: string;
  revisionNote?: string;
}

export interface Interactive {
  id: string;
  slug: string;
  sourceHref: string;
  embedHref?: string;
  aliases: readonly string[];
  title: string;
  description: string;
  objective: string;
  technology: Technology;
  technologies: readonly string[];
  topics: readonly string[];
  maturity: "Beta";
  lastTested: string;
  relatedArticle?: string;
  status: ProjectStatus;
  artLabel: string;
}

export interface Project {
  id: string;
  key: string;
  slug: string;
  sourceHref: string;
  labHref: string;
  title: string;
  subtitle: string;
  description: string;
  status: ProjectStatus;
  technologies: readonly string[];
  lastTested: string;
  accent: string;
  palette: VisualAccent;
  artLabel: string;
  interactiveCount: string;
  featured?: boolean;
  question: string;
  interactives: readonly Interactive[];
  themes: readonly string[];
  overview: readonly string[];
  relatedWriting: readonly {
    type: "Article" | "Note";
    title: string;
    meta: string;
    href: string;
  }[];
  methodology?: string;
  changelog: readonly { date: string; text: string }[];
}

export interface FooterQuote {
  id: string;
  text: string;
  author: string;
  source: string;
  sourceUrl?: string;
}

export const routes = {
  home: "/",
  articles: "/articles",
  notes: "/notes",
  projects: "/projects",
  about: "/about",
  lab: "/lab",
  rss: "/feed.xml",
} as const;

export const homeContent = {
  eyebrow: "A journal and laboratory for mathematics",
  title: "Mathematics worth returning to.",
  lede:
    "Articles, notes and interactive investigations that make mathematical ideas visible without sanding away their depth.",
  primaryAction: { label: "Start with an article", href: routes.articles },
  secondaryAction: { label: "Enter the Lab", href: routes.lab },
  featuredIdea: {
    label: "Featured idea",
    text: "Every four-bit word encodes a square tile; local matches assemble into global kolam patterns.",
    articleId: "A04",
  },
  featured: {
    label: "Featured investigation",
    title: "From sixteen tiles to fifty-one kolams",
    text: "Begin with the published exposition, take the classroom investigation further, then build and move the tiles in the Lab.",
    articleId: "A04",
    noteId: "N01",
    projectId: "P02",
  },
  updateLine: "Latest publication 7 September 2026 · 2 active projects · 6 live interactives",
} as const;

const accents = {
  blue: { color: "#6A6F86", wash: "#E9E7ED", ink: "#333541" },
  terracotta: { color: "#A66E5A", wash: "#F1E5DF", ink: "#4B3027" },
  ochre: { color: "#927C58", wash: "#EFE9DD", ink: "#463B29" },
  plum: { color: "#8C6B73", wash: "#EEE5E8", ink: "#49353B" },
  sage: { color: "#708077", wash: "#E7ECE9", ink: "#35413B" },
} as const satisfies Record<string, VisualAccent>;

const articleCatalogue: Article[] = [
  {
    id: "A01",
    key: "infinitely-many-proofs-of-pythagoras",
    articleType: "Exposition",
    slug: "/articles/infinitely-many-proofs-of-pythagoras",
    sourceHref:
      "https://mathnomad.in/articles/infinitely-many-proofs-of-pythagoras",
    title: "Infinitely many ‘proofs’ of Pythagoras’ theorem",
    subtitle:
      "Two tilings of the plane turn one familiar area identity into a continuously moving family of dissections.",
    published: "2026-07-20",
    displayDate: "20 July 2026",
    date: "20 July 2026",
    glimpse:
      "An interactive common-lattice proof of Pythagoras’ theorem, with historical anchor positions from a medieval dissection to Perigal and beyond.",
    tags: ["Geometry", "Tessellations", "Interactive"],
    audience: ["General"],
    keywords: [
      "Pythagorean theorem",
      "periodic tilings",
      "common lattices",
      "geometric dissections",
      "translational equidecomposability",
      "Perigal dissection",
      "right triangles",
      "lattice translations",
      "phase torus",
      "interactive geometry",
    ],
    msc: [
      { code: "52C20", label: "Tilings in two dimensions", role: "Primary" },
      { code: "51M04", label: "Elementary problems in Euclidean geometries", role: "Secondary" },
      { code: "52B45", label: "Dissections and valuations", role: "Secondary" },
    ],
    citationKey: "rajendran2026pythagorasproofs",
    readingMinutes: 10,
    readingTime: "10 min",
    accent: accents.blue.color,
    palette: accents.blue,
    artLabel: "Two periodic square tilings sliding across a common lattice",
    interactiveHref: "https://lab.mathnomad.in/pythagorean-tiling-proofs/",
    contents: [
      "Explore the moving proof",
      "One slider contains every right triangle",
      "Two tilings, one lattice",
      "The proof hidden in the overlay",
      "Three distinguished phases",
      "From one dissection to a moving family",
    ],
    sections: [
      {
        heading: "Explore the moving proof",
        paragraphs: [
          "The published article begins with a live tessellation in which one square grid moves over another, producing a family of dissections rather than a single static picture.",
        ],
        figureCaption:
          "The moving common-lattice construction turns a familiar identity into a family of geometric dissections.",
      },
      {
        heading: "One slider contains every right triangle",
        paragraphs: [
          "A shape parameter moves through all right triangles up to similarity, while a second parameter changes the position of the common lattice.",
        ],
      },
      {
        heading: "Two tilings, one lattice",
        paragraphs: [
          "The construction superimposes two periodic square tilings. Reading one fundamental period turns the moving overlay into an exact area identity.",
        ],
      },
      {
        heading: "The proof hidden in the overlay",
        paragraphs: [
          "The same pieces account for the two smaller squares and the square on the hypotenuse, so every permitted anchor position supplies another dissection proof.",
        ],
        formula: "a² + b² = c²",
      },
      {
        heading: "Three distinguished phases",
        paragraphs: [
          "The moving family passes through historically recognisable arrangements, including a medieval corner construction, Perigal’s dissection, and the Ferrarese phase.",
        ],
      },
      {
        heading: "From one dissection to a moving family",
        paragraphs: [
          "The final perspective is not a list of unrelated proofs but one continuous family governed by triangle shape, lattice phase, and periodic area.",
        ],
      },
    ],
    closing:
      "The complete published article includes the interactive, historical discussion, sources, and further reading.",
  },
  {
    id: "A02",
    key: "kolams-on-an-octahedron",
    articleType: "Exposition",
    slug: "/articles/kolams-on-an-octahedron",
    sourceHref: "https://mathnomad.in/articles/kolams-on-an-octahedron",
    title: "Kolams on Octahedron",
    subtitle:
      "How eight triangular tiles, a dual cube, and a seven-vertex tree lead to exactly three kolams—without exhaustive computation.",
    published: "2026-07-21T00:10:05+05:30",
    modified: "2026-07-21T00:10:05+05:30",
    displayDate: "21 July 2026",
    date: "21 July 2026",
    glimpse:
      "An expository graph-theoretic classification of triangular binary kolam tiles on an octahedron.",
    tags: ["Kolams", "Graph theory", "Polyhedra", "Symmetry"],
    audience: ["General"],
    keywords: [
      "kolam",
      "triangular kolam tiles",
      "binary kolam tiles",
      "octahedron",
      "Platonic solids",
      "cube–octahedron duality",
      "cube graph Q3",
      "graph duality",
      "Euler characteristic",
      "trees",
      "degree sequence",
      "octahedral symmetry",
      "combinatorial classification",
      "edge-matching puzzle",
    ],
    msc: [
      { code: "05C05", label: "Trees", role: "Primary" },
      { code: "05C07", label: "Vertex degrees", role: "Secondary" },
      { code: "52B10", label: "Three-dimensional polytopes", role: "Secondary" },
      { code: "52B15", label: "Symmetry properties of polytopes", role: "Secondary" },
      { code: "05E18", label: "Group actions on combinatorial structures", role: "Secondary" },
    ],
    citationKey: "rajendran2026octahedronkolams",
    readingMinutes: 16,
    readingTime: "16 min",
    accent: accents.terracotta.color,
    palette: accents.terracotta,
    artLabel: "A stylised white kolam drawn across a terracotta octahedron",
    imageSrc: "/articles/kolams-on-an-octahedron/octahedron-hero.svg",
    imageAlt:
      "A stylised white kolam drawn across the triangular faces of a terracotta octahedron",
    interactiveHref: "https://lab.mathnomad.in/kolams-on-an-octahedron/",
    contents: [
      "From a square board to a closed surface",
      "Eight triangular tiles",
      "The cube hidden inside the octahedron",
      "Twelve exits become six edges",
      "A subdivided Y",
      "Symmetry and the final count",
    ],
    sections: [
      {
        heading: "From a square board to a closed surface",
        paragraphs: [
          "The investigation moves binary kolam tiles from a planar board to the eight triangular faces of an octahedron.",
        ],
        figureCaption:
          "A published hero image showing a white kolam crossing the faces of a terracotta octahedron.",
      },
      {
        heading: "Eight triangular tiles",
        paragraphs: [
          "The eight three-bit words describe the possible openings of an oriented triangular tile, one tile for each face.",
        ],
      },
      {
        heading: "The cube hidden inside the octahedron",
        paragraphs: [
          "Passing to the dual cube turns face labels into vertex degrees and converts the surface drawing into a graph-theoretic problem.",
        ],
      },
      {
        heading: "Twelve exits become six edges",
        paragraphs: [
          "The matching conditions and total number of exits sharply restrict the dual graph, forcing two components and a seven-vertex tree.",
        ],
      },
      {
        heading: "A subdivided Y",
        paragraphs: [
          "The relevant tree is a subdivided Y. Its three arm-length patterns supply the candidate connected kolams.",
        ],
      },
      {
        heading: "Symmetry and the final count",
        paragraphs: [
          "A directional symmetry argument shows that each arm-length type has one realisation up to the full octahedral symmetry group, giving exactly three classes.",
        ],
        callout: "Exactly three connected kolams, obtained without exhaustive computation.",
      },
    ],
    closing:
      "The full article includes the proof, cultural and mathematical notes, citations, and a foldable interactive explorer.",
  },
  {
    id: "A03",
    key: "law-of-cosines",
    articleType: "Exposition",
    slug: "/articles/law-of-cosines",
    sourceHref: "https://mathnomad.in/articles/law-of-cosines",
    title: "The Law of Cosines",
    subtitle:
      "A moving tessellation turns Pythagoras into the cosine rule, with overlaps for acute triangles and gaps for obtuse ones.",
    published: "2026-07-21",
    displayDate: "21 July 2026",
    date: "21 July 2026",
    glimpse:
      "An interactive tessellation proof of the law of cosines, organised over the two-dimensional moduli space of triangle shapes.",
    tags: ["Geometry", "Tessellations", "Interactive"],
    audience: ["General"],
    keywords: [
      "law of cosines",
      "cosine rule",
      "triangle moduli space",
      "periodic tessellations",
      "cosine parallelograms",
      "vector geometry",
      "signed area",
      "acute triangles",
      "obtuse triangles",
      "interactive geometry",
    ],
    msc: [
      { code: "51M04", label: "Elementary problems in Euclidean geometries", role: "Primary" },
      { code: "52C20", label: "Tilings in two dimensions", role: "Secondary" },
      { code: "51N20", label: "Euclidean analytic geometry", role: "Secondary" },
    ],
    citationKey: "rajendran2026lawofcosines",
    readingMinutes: 5,
    readingTime: "5 min",
    accent: accents.ochre.color,
    palette: accents.ochre,
    artLabel: "A triangle and two-colour periodic tiling over a square grid",
    interactiveHref: "https://lab.mathnomad.in/law-of-cosines/",
    contents: [
      "The space of triangle shapes",
      "Explore the tessellation",
      "The vectors behind the picture",
      "The cosine parallelograms",
      "Reading the proof from the tessellation",
      "Why the anchor can move",
    ],
    sections: [
      {
        heading: "The space of triangle shapes",
        paragraphs: [
          "Triangles up to similarity form a two-dimensional space. The interactive lets the reader move through that space rather than inspect isolated acute, right, and obtuse cases.",
        ],
        figureCaption:
          "A movable tessellation connects acute, right and obtuse triangles in one construction.",
      },
      {
        heading: "Explore the tessellation",
        paragraphs: [
          "A movable square grid is translated across a two-colour periodic tiling so that overlaps and uncovered regions can be compared directly.",
        ],
      },
      {
        heading: "The vectors behind the picture",
        paragraphs: [
          "Vector relations identify the repeated cells and connect their signed areas to the side lengths and included angle of the triangle.",
        ],
      },
      {
        heading: "The cosine parallelograms",
        paragraphs: [
          "Two parallelograms encode the cosine correction. They appear as overlaps for acute triangles and as gaps for obtuse triangles.",
        ],
      },
      {
        heading: "Reading the proof from the tessellation",
        paragraphs: [
          "Reading one fundamental period yields the cosine rule; at a right angle the correction collapses and the construction becomes Pythagoras.",
        ],
        formula: "c² = a² + b² − 2ab cos(C)",
      },
      {
        heading: "Why the anchor can move",
        paragraphs: [
          "Periodicity makes the proof independent of the chosen grid phase, so every permitted translation gives a different picture of the same identity.",
        ],
      },
    ],
    closing:
      "The complete article contains the interactive instructions, vector derivation, acute and obtuse cases, and continuation links.",
  },
  {
    id: "A04",
    key: "binary-kolam-tiles",
    articleType: "Exposition",
    slug: "/articles/kolams-on-a-square",
    sourceHref: "https://mathnomad.in/articles/kolams-on-a-square/",
    title: "From Sixteen Tiles to Fifty-One Kolams",
    subtitle:
      "How a puzzle based on kolam tiles meets graph theory, Boolean satisfiability, and the mathematics of symmetry.",
    published: "2026-07-17T14:45:00+05:30",
    modified: "2026-07-17T18:40:00+05:30",
    displayDate: "17 July 2026",
    date: "17 July 2026",
    glimpse:
      "An interactive exposition connecting square kolam tiles, graph theory, Boolean satisfiability, exhaustive enumeration, and Burnside’s lemma.",
    tags: [
      "Kolams",
      "Combinatorics",
      "Graph theory",
      "Boolean satisfiability",
      "Burnside's lemma",
      "Symmetry",
    ],
    audience: ["General"],
    keywords: [
      "kolam",
      "pulli kolam",
      "sikku kolam",
      "binary kolam tiles",
      "square-tile kolam",
      "edge-matching puzzle",
      "exact combinatorial enumeration",
      "graph connectivity",
      "Boolean satisfiability",
      "SAT",
      "Burnside’s lemma",
      "orbit counting",
      "dihedral group D4",
      "recreational mathematics",
    ],
    msc: [
      { code: "05A15", label: "Exact enumeration problems", role: "Primary" },
      { code: "05B45", label: "Combinatorial aspects of tessellation and tiling", role: "Secondary" },
      { code: "05E18", label: "Group actions on combinatorial structures", role: "Secondary" },
      { code: "68R07", label: "Computational aspects of satisfiability", role: "Secondary" },
      { code: "68V05", label: "Computer-assisted proofs by exhaustion", role: "Secondary" },
    ],
    citationKey: "rajendran2026kolams",
    readingMinutes: 19,
    readingTime: "19 min",
    accent: accents.plum.color,
    palette: accents.plum,
    artLabel: "A white square kolam assembled from sixteen curve tiles",
    imageSrc: "/articles/binary-kolam-tiles/kolam-13-hero.webp",
    imageAlt:
      "A white square kolam on a terracotta background, assembled from sixteen curve tiles",
    interactiveHref: "https://lab.mathnomad.in/square-kolam-tile-challenge/",
    featured: true,
    contents: [
      "Kolam at the threshold",
      "From six shapes to sixteen tiles",
      "Try the puzzle before reading on",
      "A precise model of the board",
      "From a puzzle to satisfiability",
      "When are two answers really the same?",
      "Burnside’s lemma and the number 51",
    ],
    sections: [
      {
        heading: "Kolam at the threshold",
        paragraphs: [
          "The article begins with the practice of kolam and then isolates a deliberately simplified binary-tile model for mathematical investigation.",
        ],
        figureCaption:
          "The published hero image shows one connected square kolam assembled from all sixteen binary tiles.",
      },
      {
        heading: "From six shapes to sixteen tiles",
        paragraphs: [
          "Each four-bit word records openings to the east, north, west, and south, producing a complete catalogue of sixteen globally oriented tiles.",
        ],
      },
      {
        heading: "Try the puzzle before reading on",
        paragraphs: [
          "The construction challenge asks for every tile exactly once, matching neighbouring edges, a closed boundary, and one connected network among the nonzero tiles.",
        ],
      },
      {
        heading: "A precise model of the board",
        paragraphs: [
          "Local edge constraints become Boolean equalities while global connectivity becomes a graph condition on the active edges.",
        ],
      },
      {
        heading: "From a puzzle to satisfiability",
        paragraphs: [
          "Exhaustive enumeration reduces 1,448 horizontally legal rows to 652 locally valid boards and then to 408 connected nonzero networks.",
        ],
      },
      {
        heading: "When are two answers really the same?",
        paragraphs: [
          "Rotations and reflections of the square identify boards that differ only by orientation, changing the task from enumeration to orbit counting.",
        ],
      },
      {
        heading: "Burnside’s lemma and the number 51",
        paragraphs: [
          "Fixed-point counts under the eight symmetries of the square reduce the 408 accepted boards to fifty-one symmetry classes.",
        ],
        callout: "16 binary tiles · 408 accepted boards · 51 symmetry classes",
      },
    ],
    closing:
      "The full article includes the live puzzle, reproducibility notes, sources, and a downloadable catalogue of all fifty-one representatives.",
  },
  {
    id: "A05",
    key: "moving-the-starting-line-in-stirlings-formula",
    articleType: "Reflection",
    slug: "/articles/moving-the-starting-line-in-stirlings-formula",
    sourceHref:
      "https://mathnomad.in/articles/moving-the-starting-line-in-stirlings-formula/",
    title: "Starting Later: Geometric Bounds for Stirling’s Formula",
    subtitle:
      "A reflection on Bikash Chakraborty’s article in The College Mathematics Journal, with a geometric extension of its bounds.",
    published: "2026-09-07",
    displayDate: "7 September 2026",
    date: "7 September 2026",
    glimpse:
      "Beginning with a chord-and-tangent proof for log x, we move the starting point and uncover a nested family of bounds for the normalized factorial.",
    tags: ["Stirling’s formula", "Asymptotic analysis", "Inequalities", "Interactive"],
    audience: ["Undergraduate"],
    keywords: [
      "Stirling’s formula",
      "asymptotic analysis",
      "inequalities",
      "Stirling approximation",
    ],
    msc: [
      { code: "41A60", label: "Asymptotic approximations and expansions", role: "Primary" },
      { code: "26D15", label: "Inequalities for sums, series and integrals", role: "Secondary" },
    ],
    citationKey: "rajendranStirlingBounds",
    readingMinutes: 12,
    readingTime: "12 min",
    accent: accents.sage.color,
    palette: accents.sage,
    artLabel: "Chords and tangents enclosing the graph of the natural logarithm",
    draft: false,
    contents: [
      "The geometric core idea of Chakraborty’s argument",
      "Move the starting point",
      "When the integer becomes real",
    ],
    sections: [
      {
        heading: "The geometric core idea of Chakraborty’s argument",
        paragraphs: [
          "Chords joining consecutive integer points lie below the graph of log x, while tangents at integers cover centred intervals with half-integer endpoints from above.",
        ],
      },
      {
        heading: "Move the starting point",
        paragraphs: [
          "Keeping the first few factors exact and applying the same area comparison only from a later integer k produces a parameter rather than a single pair of constants.",
        ],
      },
      {
        heading: "When the integer becomes real",
        paragraphs: [
          "Replacing the factorial by the Gamma function turns the discrete normalized sequence into a continuous function and reveals a companion lower curve.",
        ],
      },
    ],
    closing:
      "Moving the starting point preserves the geometric method while producing a nested family of sharper bounds.",
  },
];

const articleSameDateOrder: Record<string, number> = {
  "law-of-cosines": 0,
  "kolams-on-an-octahedron": 1,
  "infinitely-many-proofs-of-pythagoras": 2,
  "binary-kolam-tiles": 3,
};

const includeDraftArticles =
  process.env.NEXT_PUBLIC_MATH_NOMAD_PREVIEW_DRAFTS === "true";

export const articles: Article[] = articleCatalogue
  .filter((article) => !article.draft || includeDraftArticles)
  .sort(
  (first, second) =>
    second.published.slice(0, 10).localeCompare(first.published.slice(0, 10)) ||
    (articleSameDateOrder[first.key] ?? Number.MAX_SAFE_INTEGER) -
      (articleSameDateOrder[second.key] ?? Number.MAX_SAFE_INTEGER),
  );

export const noteFields: readonly NoteField[] = ["Combinatorics", "Linear Algebra"];

const noteCatalogue: Note[] = [
  {
    id: "N01",
    bodyKey: "kolam-investigation",
    slug: "/notes/combinatorics/sixteen-tiles-one-kolam-puzzle",
    sourceHref:
      "https://mathnomad.in/notes/combinatorics/sixteen-tiles-one-kolam-puzzle",
    title: "Sixteen Tiles, One Kolam Puzzle",
    field: "Combinatorics",
    topics: ["Binary tiles", "Connectivity", "Invariants"],
    kind: "Course resource",
    level: ["General", "Undergraduate"],
    audience: "Upper-secondary students, teachers, clubs and undergraduate problem-solving groups",
    format: "Online resource",
    publishedAt: "2026-07-15",
    published: "15 July 2026",
    revisedAt: "2026-07-15",
    revised: "Published 15 July 2026",
    displayRevision: "Published 15 July 2026",
    abstract:
      "A classroom-ready investigation using binary tiles to explore local constraints, connectivity and sliding-puzzle invariants.",
    showOnHomepage: true,
    estimatedTime: "One or two class meetings",
    prerequisites: ["No specialist prerequisites"],
    resources: [
      {
        kind: "Interactive",
        label: "Launch the board",
        href: "https://lab.mathnomad.in/square-kolam-tile-challenge/",
      },
      {
        kind: "Article",
        label: "Read the exposition",
        href: "/articles/kolams-on-a-square",
      },
    ],
    imageSrc: "/articles/binary-kolam-tiles/kolam-tiles.webp",
    imageAlt: "The sixteen binary kolam tiles arranged as a catalogue",
    contents: [
      "The central question",
      "A possible classroom rhythm",
      "Problems to carry further",
      "Teacher notes",
    ],
    learningGoals: [
      "Distinguish local edge-matching conditions from the global connectivity condition.",
      "Use failed and successful configurations as evidence for a conjecture.",
      "Identify quantities that remain invariant under legal sliding moves.",
      "Separate experimental or computational evidence from proof.",
    ],
    sampleText:
      "Can every binary tile from 0000 to 1111 be used exactly once in a 4 × 4 square so that the boundary is closed, adjacent sides match and the fifteen nonzero tiles form one connected network?",
  },
  {
    id: "N02",
    bodyKey: "row-reduction-exposition",
    slug: "/notes/linear-algebra/what-row-reduction-remembers",
    sourceHref:
      "https://mathnomad.in/notes/linear-algebra/what-row-reduction-remembers",
    title: "What Row Reduction Remembers",
    subtitle:
      "The geometry of intersecting lines, equation spaces, and the general-rank picture",
    field: "Linear Algebra",
    topics: [
      "Row reduction",
      "Row spaces",
      "Affine geometry",
      "Projective geometry",
    ],
    kind: "Expository note",
    level: ["Undergraduate"],
    audience:
      "Advanced undergraduate readers who know systems of linear equations and the basic language of vector spaces",
    format: "Article + PDF",
    publishedAt: "2026-08-09",
    published: "9 August 2026",
    revisedAt: "2026-08-09",
    revised: "Published 9 August 2026",
    displayRevision: "Published 9 August 2026",
    abstract:
      "A geometric reading of row reduction: why RREF remembers the row space, how elimination moves through a pencil of lines, and what survives for arbitrary linear systems.",
    estimatedTime: "12-minute introduction · 25-page full note",
    prerequisites: [
      "Systems of linear equations and Gaussian elimination",
      "Span, linear independence, basis and rank",
    ],
    keywords: [
      "row reduction",
      "reduced row echelon form",
      "Gaussian elimination",
      "linear systems",
      "row space",
      "affine geometry",
      "projective geometry",
      "Grassmannians",
    ],
    msc: [
      {
        code: "15A06",
        label: "Linear equations (linear algebraic aspects)",
        role: "Primary",
      },
      {
        code: "15A03",
        label: "Vector spaces, linear dependence and rank",
        role: "Secondary",
      },
      {
        code: "15A21",
        label: "Canonical forms, reductions and classification",
        role: "Secondary",
      },
      {
        code: "51N10",
        label: "Affine analytic geometry",
        role: "Secondary",
      },
      {
        code: "51N15",
        label: "Projective analytic geometry",
        role: "Secondary",
      },
    ],
    citationKey: "rajendran2026rowreduction",
    citationSeries: "Math Nomad Undergraduate Exposition",
    proofStatus:
      "Complete author-verified exposition; standard background results are cited where they are not reproved.",
    showCaution: false,
    showOnHomepage: true,
    resources: [
      {
        kind: "PDF",
        label: "Open the full PDF",
        href: "/notes/linear-algebra/what-row-reduction-remembers/what-row-reduction-remembers.pdf",
        pages: 25,
        embed: true,
      },
    ],
    contents: [
      "Two lines, one intersection",
      "The object that does not move",
      "A coordinate-adapted basis",
      "What the full note develops",
      "Read the full note",
    ],
    learningGoals: [
      "Interpret an elementary row operation as a change of generators in the space of equations.",
      "Explain why row-equivalent matrices have the same row space and solution set.",
      "See RREF as a canonical, coordinate-adapted basis rather than only an algorithmic endpoint.",
      "Recognise how the planar picture extends towards projective geometry and arbitrary linear systems.",
    ],
    sampleText:
      "Row reduction preserves the space of equations generated by a system while forgetting the ordered basis used to present it.",
  },
];

export const notes: Note[] = [...noteCatalogue].sort((first, second) =>
  second.publishedAt.localeCompare(first.publishedAt),
);

export const projects: Project[] = [
  {
    id: "P01",
    key: "tessellations",
    slug: "/projects/tessellations",
    sourceHref: "https://mathnomad.in/projects/tessellations",
    labHref: "https://lab.mathnomad.in/",
    title: "Tessellations",
    subtitle: "Periodic patterns as movable area proofs",
    description:
      "Interactive investigations in which periodic patterns turn area identities into movable geometric proofs.",
    status: "Active now",
    technologies: ["React", "TypeScript", "SVG"],
    lastTested: "29 July 2026",
    accent: accents.blue.color,
    palette: accents.blue,
    artLabel: "Two softly coloured square tilings sliding across one another",
    interactiveCount: "2 interactives",
    featured: true,
    question:
      "How much geometry can be made visible by superimposing periodic tilings and moving one layer across another?",
    themes: ["Geometry", "Tessellations", "Area identities"],
    overview: [
      "Tessellations turn a single area diagram into a family. A periodic pattern can be clipped by a movable square grid, and every grid position produces another dissection of the same identity.",
      "For right triangles, two square tilings express Pythagoras. For a general triangle, the same architecture reveals cosine parallelograms as overlaps, gaps, or a right-angle transition.",
    ],
    interactives: [
      {
        id: "I01",
        slug: "law-of-cosines",
        sourceHref: "https://lab.mathnomad.in/law-of-cosines/",
        embedHref: "https://lab.mathnomad.in/embed/law-of-cosines/",
        aliases: ["/law-of-cosines/"],
        title: "The Law of Cosines",
        description:
          "Move through the moduli space of triangle shapes, then translate a square grid across the two-colour tessellation.",
        objective:
          "Explore a tessellation proof of the law of cosines for acute, right and obtuse triangles.",
        technology: "JavaScript",
        technologies: ["React", "TypeScript", "SVG"],
        topics: ["Geometry", "Tessellations", "Moduli spaces"],
        maturity: "Beta",
        lastTested: "2026-07-29",
        relatedArticle: "/articles/law-of-cosines",
        status: "Available",
        artLabel: "A two-colour tessellation crossed by a movable square grid",
      },
      {
        id: "I02",
        slug: "pythagorean-tiling-proofs",
        sourceHref: "https://lab.mathnomad.in/pythagorean-tiling-proofs/",
        embedHref: "https://lab.mathnomad.in/embed/pythagorean-tiling-proofs/",
        aliases: ["/pythagorean-tiling-proofs/"],
        title: "Infinitely many “proofs” of Pythagoras",
        description:
          "Slide one square tiling over another and visit the medieval, Perigal, and Ferrarese dissection phases.",
        objective:
          "Explore a continuously moving family of tessellation proofs of Pythagoras’ theorem.",
        technology: "JavaScript",
        technologies: ["React", "TypeScript", "SVG"],
        topics: ["Geometry", "Tessellations", "Pythagoras"],
        maturity: "Beta",
        lastTested: "2026-07-29",
        relatedArticle: "/articles/infinitely-many-proofs-of-pythagoras",
        status: "Available",
        artLabel: "Two square tilings forming a moving Pythagorean dissection",
      },
    ],
    relatedWriting: [
      {
        type: "Article",
        title: "The Law of Cosines",
        meta: "21 July 2026 · 5 min",
        href: "/articles/law-of-cosines",
      },
      {
        type: "Article",
        title: "Infinitely many ‘proofs’ of Pythagoras’ theorem",
        meta: "20 July 2026 · 10 min",
        href: "/articles/infinitely-many-proofs-of-pythagoras",
      },
    ],
    methodology:
      "Periodic tilings are treated as families over triangle shape and grid phase, with signed areas turning the experiment into a proof.",
    changelog: [
      {
        date: "21 July 2026",
        text: "The Pythagorean sandbox added a movable anchor, mirror orientation and historically distinguished phases.",
      },
    ],
  },
  {
    id: "P02",
    key: "kolam-tiles",
    slug: "/projects/kolam-tiles",
    sourceHref: "https://mathnomad.in/projects/kolam-tiles",
    labHref: "https://lab.mathnomad.in/",
    title: "Kolam Tiles",
    subtitle: "Local matching, global connectivity and symmetry",
    description:
      "Binary kolam tiles on square boards and polyhedral surfaces: local matching, global connectivity, graph structure, symmetry, puzzles, and interactive constructions.",
    status: "Active now",
    technologies: ["React", "TypeScript", "SVG"],
    lastTested: "29 July 2026",
    accent: accents.terracotta.color,
    palette: accents.terracotta,
    artLabel: "Binary kolam tiles assembled into a connected network",
    interactiveCount: "4 interactives",
    featured: true,
    question:
      "What global forms emerge when binary kolam tiles are assembled under local edge-matching rules?",
    themes: ["Kolams", "Combinatorics", "Graph theory", "Symmetry"],
    overview: [
      "The square branch encodes the sixteen four-bit words as globally oriented tiles. Adjacent bits must match, the boundary must close, and the fifteen nonzero tiles must form one connected network.",
      "Removing the 0000 tile produces a labelled 15-puzzle, bringing parity and orbit structure into the problem of moving between valid boards.",
      "The triangular branch places the eight three-bit words on an octahedron; the dual cube converts the classification into a forced seven-vertex tree with three arm-length patterns.",
    ],
    interactives: [
      {
        id: "I03",
        slug: "square-kolam-tile-challenge",
        sourceHref: "https://lab.mathnomad.in/square-kolam-tile-challenge/",
        embedHref: "https://lab.mathnomad.in/embed/square-kolam-tile-challenge/",
        aliases: ["/square-kolam-tile-challenge/"],
        title: "Square Kolam Tile Challenge",
        description:
          "Use all sixteen globally oriented tiles to build one connected nonzero kolam on a 4 × 4 board.",
        objective:
          "Build a valid connected square kolam from all sixteen binary tiles.",
        technology: "JavaScript",
        technologies: ["React", "TypeScript", "SVG"],
        topics: ["Kolams", "Edge matching", "Connectivity"],
        maturity: "Beta",
        lastTested: "2026-07-29",
        relatedArticle: "/articles/kolams-on-a-square",
        status: "Available",
        artLabel: "Sixteen binary kolam tiles beside a four by four board",
      },
      {
        id: "I04",
        slug: "sandbox-2",
        sourceHref: "https://lab.mathnomad.in/sandbox-2/",
        aliases: ["/sandbox-2/"],
        title: "Slide to a New Kolam",
        description:
          "Move tiles through the open cell while preserving a correct square kolam, and watch the orbit invariant.",
        objective:
          "Reach a different correct kolam through legal fifteen-puzzle moves.",
        technology: "JavaScript",
        technologies: ["React", "TypeScript", "SVG"],
        topics: ["Kolams", "Fifteen puzzle", "Invariants"],
        maturity: "Beta",
        lastTested: "2026-07-29",
        status: "Available",
        artLabel: "A square kolam arranged as a fifteen-puzzle with one open cell",
      },
      {
        id: "I05",
        slug: "sandbox-3",
        sourceHref: "https://lab.mathnomad.in/sandbox-3/",
        aliases: ["/sandbox-3/"],
        title: "Move X to Y",
        description:
          "Transform one completed kolam into another and compare two configurations in the same 15-puzzle orbit.",
        objective:
          "Compare two configurations and find a legal route from X to Y.",
        technology: "JavaScript",
        technologies: ["React", "TypeScript", "SVG"],
        topics: ["Kolams", "Fifteen puzzle", "Shortest paths"],
        maturity: "Beta",
        lastTested: "2026-07-29",
        status: "Available",
        artLabel: "Two completed kolam boards shown side by side",
      },
      {
        id: "I06",
        slug: "kolams-on-an-octahedron",
        sourceHref: "https://lab.mathnomad.in/kolams-on-an-octahedron/",
        embedHref: "https://lab.mathnomad.in/embed/kolams-on-an-octahedron/",
        aliases: ["/kolams-on-an-octahedron/"],
        title: "Kolams on an Octahedron",
        description:
          "Compare three connected triangular kolam nets, fold each into an octahedron, and explore the completed solid.",
        objective:
          "See how the three connected triangular kolams pass from flat nets to an octahedron.",
        technology: "JavaScript",
        technologies: ["TypeScript", "SVG"],
        topics: ["Kolams", "Graph theory", "Polyhedra"],
        maturity: "Beta",
        lastTested: "2026-07-29",
        relatedArticle: "/articles/kolams-on-an-octahedron",
        status: "Available",
        artLabel: "Three triangular kolam nets folding into octahedra",
      },
    ],
    relatedWriting: [
      {
        type: "Article",
        title: "From Sixteen Tiles to Fifty-One Kolams",
        meta: "17 July 2026 · 19 min",
        href: "/articles/kolams-on-a-square",
      },
      {
        type: "Article",
        title: "Kolams on Octahedron",
        meta: "21 July 2026 · 16 min",
        href: "/articles/kolams-on-an-octahedron",
      },
      {
        type: "Note",
        title: "Sixteen Tiles, One Kolam Puzzle",
        meta: "Course resource · 15 July 2026",
        href: "/notes/combinatorics/sixteen-tiles-one-kolam-puzzle",
      },
    ],
    methodology:
      "The current public project connects square-tile puzzles and triangular-tile polyhedra through graphs, symmetry and interactive constructions.",
    changelog: [
      {
        date: "20 July 2026",
        text: "The octahedron explorer and its graph-theoretic article joined the three square-tile sandboxes.",
      },
    ],
  },
];

export const quotes: readonly FooterQuote[] = [
  {
    id: "Q01",
    text: "Mathematics, you see, is not a spectator sport. To understand mathematics means to be able to do mathematics.",
    author: "George Pólya",
    source: "Lecture on teaching mathematics",
    sourceUrl: "https://mathshistory.st-andrews.ac.uk/Biographies/Polya/",
  },
  {
    id: "Q02",
    text: "Mathematics is the art of giving the same name to different things.",
    author: "Henri Poincaré",
    source: "Science and Method, Chapter II",
    sourceUrl: "https://henripoincarepapers.univ-nantes.fr/chp/hp-pdf/hp1914sm.pdf",
  },
  {
    id: "Q03",
    text: "A mathematician, like a painter or a poet, is a maker of patterns.",
    author: "G. H. Hardy",
    source: "A Mathematician’s Apology, Chapter 10",
    sourceUrl: "https://www.cambridge.org/core/books/abs/mathematicians-apology/10/1ECD7C400B32DDEC3ADFBBE39C89D4D1",
  },
  {
    id: "Q04",
    text: "The essence of mathematics lies in its freedom.",
    author: "Georg Cantor",
    source: "Mathematische Annalen, volume 21 (1883), page 564",
  },
];
