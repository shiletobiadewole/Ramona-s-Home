import type { CategoryOverview, PropertyCategory, PropertyRecord } from '../types/property';

export const HERO_IMAGE = {
  src: '/src/assets/images/hero_residential_living_1795265798878.jpg',
  alt: 'Sunlit contemporary residential living room with bronze-framed glass walls opening onto a private landscaped courtyard garden',
};

export const HERO_VIDEO = {
  src: '/src/assets/videos/ramona_hero_showcase.mp4',
  posterSrc: '/src/assets/images/hero_exterior_establishing_1795336207140.jpg',
  alt: 'Architectural showcase film featuring Ramona’s Home limestone and cedar residences, urban plexes, courtyard garden suites, movable pavilions, and sunlit interiors',
};

export const INTERIOR_DETAIL_IMAGE = {
  src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
  alt: 'Bespoke modern residential kitchen with honed travertine stone island, quarter-sawn oak millwork, and garden courtyard views',
};

export const CATEGORY_OVERVIEWS: CategoryOverview[] = [
  {
    category: 'Plexes',
    slug: 'plexes',
    title: 'Plexes',
    summary:
      'Multi-residence architectural buildings conceived for multi-generational living, privacy, and enduring streetscape presence.',
    architecturalFocus:
      'Honed masonry, recessed private terraces, acoustic separation, and generous daylighting across every level.',
    image: {
      src: '/src/assets/images/category_plex_exterior_1795265798770.jpg',
      alt: 'Contemporary multi-unit residential plex exterior in limestone and vertical cedar with landscaped terraces',
    },
  },
  {
    category: 'Laneway Houses & Garden Suites',
    slug: 'laneway-houses-garden-suites',
    title: 'Laneway Houses & Garden Suites',
    summary:
      'Intimate courtyard-oriented dwellings tucked seamlessly behind established residential lots.',
    architecturalFocus:
      'Warm vertical cedar cladding, fluid indoor-outdoor glazing, and compact spatial efficiency.',
    image: {
      src: '/src/assets/images/category_laneway_suite_1795265798274.jpg',
      alt: 'Modern cedar-clad laneway house and garden suite overlooking a stone-paved courtyard at dusk',
    },
  },
  {
    category: 'Movable Houses',
    slug: 'movable-houses',
    title: 'Movable Houses',
    summary:
      'Precision-crafted architectural residences engineered to adapt to evolving land, light, and lifestyle needs.',
    architecturalFocus:
      'Structural steel and timber framing, expansive glazing, and site-sensitive placement with minimal ground disturbance.',
    image: {
      src: '/src/assets/images/category_movable_house_1795265797908.jpg',
      alt: 'Contemporary movable modular residential home in dark metal and oak set in an open meadow',
    },
  },
];

/**
 * Architectural typology showcase entries.
 * Note: To remain strictly faithful to real inventory, no street addresses,
 * prices, or live availability statuses are fabricated on these showcase studies.
 * Live inventory fields (location, budgetOrPrice, features, specifications)
 * render automatically whenever supplied by an external property source.
 */
export const PROPERTY_PORTFOLIO: PropertyRecord[] = [
  {
    id: 'rh-plex-courtyard',
    slug: 'limestone-cedar-triplex-study',
    title: 'Limestone & Cedar Triplex Study',
    category: 'Plexes',
    shortDescription:
      'Three independent residences united behind a quiet facade of honed limestone, natural cedar, and planted terrace setbacks.',
    description:
      'Conceived as an architectural alternative to conventional urban density, this plex typology balances private entryways with shared courtyard calm. Full-height glazing draws southern light deep into each living level while recessed upper balconies maintain privacy along tree-lined residential streets.',
    heroImage: {
      src: '/src/assets/images/category_plex_exterior_1795265798770.jpg',
      alt: 'Limestone and vertical cedar triplex exterior with recessed planted terraces',
      caption: 'Street elevation featuring honed limestone base and vertical cedar upper volume.',
    },
    gallery: [
      {
        src: '/src/assets/images/category_plex_exterior_1795265798770.jpg',
        alt: 'Limestone and cedar triplex facade at golden hour',
        caption: 'Primary architectural elevation and landscaped forecourt.',
      },
      {
        src: '/src/assets/images/hero_residential_living_1795265798878.jpg',
        alt: 'Ground-level living area opening onto private garden courtyard',
        caption: 'Main floor living room oriented toward private courtyard greenery.',
      },
      {
        src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
        alt: 'Kitchen with travertine island and oak cabinetry',
        caption: 'Natural material palette combining honed stone and quarter-sawn oak.',
      },
    ],
    isTypologyStudy: true,
    features: [
      'Private ground-level and upper terrace access',
      'Acoustic floor-assembly separation between suites',
      'Honed stone and vertical cedar exterior envelope',
    ],
  },
  {
    id: 'rh-laneway-pavilion',
    slug: 'cedar-courtyard-laneway-study',
    title: 'Cedar Courtyard Laneway Study',
    category: 'Laneway Houses & Garden Suites',
    shortDescription:
      'A two-level garden dwelling framed in warm cedar and stone pavers, opening completely onto a sheltered courtyard.',
    description:
      'Designed for tranquil multi-generational living or independent studio residence, this laneway and garden suite study prioritizes natural ventilation, tactile timber surfaces, and seamless visual continuity with the surrounding garden.',
    heroImage: {
      src: '/src/assets/images/category_laneway_suite_1795265798274.jpg',
      alt: 'Two-storey cedar laneway residence facing a stone-paved garden courtyard',
      caption: 'Evening courtyard view highlighting wide-span sliding glass doors.',
    },
    gallery: [
      {
        src: '/src/assets/images/category_laneway_suite_1795265798274.jpg',
        alt: 'Cedar laneway suite exterior and garden pathway',
        caption: 'Laneway pavilion framed by perennial courtyard planting.',
      },
      {
        src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
        alt: 'Open-plan kitchen and dining space with courtyard door',
        caption: 'Daylit kitchen and dining space overlooking the garden terrace.',
      },
      {
        src: '/src/assets/images/hero_residential_living_1795265798878.jpg',
        alt: 'Minimalist living space with timber shelving and stone coffee table',
        caption: 'Living room crafted with warm linen and natural oak textures.',
      },
    ],
    isTypologyStudy: true,
    features: [
      'Wide-aperture sliding doors for indoor-outdoor living',
      'Independent rear-lot orientation for acoustic calm',
      'Integrated oak joinery and skylight stairwells',
    ],
  },
  {
    id: 'rh-movable-meadow',
    slug: 'timber-steel-movable-pavilion',
    title: 'Timber & Steel Movable Pavilion',
    category: 'Movable Houses',
    shortDescription:
      'A relocatable architectural home built with precision steel framing, white oak interiors, and an elevated cedar deck.',
    description:
      'Engineered for freedom of placement without sacrificing architectural permanence, this movable residence pairs clerestory glazing with durable standing-seam metalwork. Designed to sit lightly on its site while framing panoramic views of the landscape.',
    heroImage: {
      src: '/src/assets/images/category_movable_house_1795265797908.jpg',
      alt: 'Movable modular house in matte dark steel and white oak with wrap-around deck',
      caption: 'Elevated timber deck and full-span corner glazing.',
    },
    gallery: [
      {
        src: '/src/assets/images/category_movable_house_1795265797908.jpg',
        alt: 'Movable architectural pavilion set in natural meadow',
        caption: 'Low-impact pier foundation preserving surrounding terrain.',
      },
      {
        src: '/src/assets/images/hero_residential_living_1795265798878.jpg',
        alt: 'Warm timber and glass residential interior',
        caption: 'Continuous interior sightlines to surrounding landscape.',
      },
      {
        src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
        alt: 'Compact architectural kitchen in oak and travertine',
        caption: 'Custom millwork tailored for effortless daily living.',
      },
    ],
    isTypologyStudy: true,
    features: [
      'Relocatable precision structural steel chassis',
      'Clerestory windows for balanced natural daylight',
      'Modular timber decking with minimal site footprint',
    ],
  },
  {
    id: 'rh-plex-corner-terrace',
    slug: 'architectural-duplex-terrace-study',
    title: 'Architectural Duplex Terrace Study',
    category: 'Plexes',
    shortDescription:
      'Dual-aspect residential architecture pairing generous private outdoor terraces with quiet, gallery-like interiors.',
    description:
      'An exploration of calm proportions and daylight in a two-residence architectural format. Dedicated entrances and staggered terrace geometry allow each household to experience single-home privacy within a refined urban footprint.',
    heroImage: {
      src: '/src/assets/images/hero_residential_living_1795265798878.jpg',
      alt: 'Spacious architectural living space opening to private courtyard',
      caption: 'Garden-level residence with bronze-framed patio doors.',
    },
    gallery: [
      {
        src: '/src/assets/images/hero_residential_living_1795265798878.jpg',
        alt: 'Sunlit living room opening onto landscaped patio',
        caption: 'Floor-to-ceiling glazing uniting interior living with courtyard greenery.',
      },
      {
        src: '/src/assets/images/category_plex_exterior_1795265798770.jpg',
        alt: 'Exterior masonry and cedar detail',
        caption: 'Exterior terrace composition and ornamental landscaping.',
      },
    ],
    isTypologyStudy: true,
    features: [
      'Staggered terrace geometry for enhanced privacy',
      'Bronze-anodized glazing and honed plaster walls',
      'Dedicated ground-level outdoor living zone',
    ],
  },
  {
    id: 'rh-garden-studio-atelier',
    slug: 'courtyard-garden-suite-atelier',
    title: 'Courtyard Garden Suite & Atelier',
    category: 'Laneway Houses & Garden Suites',
    shortDescription:
      'Single-level garden suite crafted around morning light, plaster walls, and direct terrace access.',
    description:
      'Thoughtfully proportioned for compact urban sites, this garden suite balances work, rest, and hosting around a central stone-paved garden court. Every surface is chosen for warmth and longevity.',
    heroImage: {
      src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
      alt: 'High-ceiling residential kitchen and courtyard terrace opening',
      caption: 'Double-height glazing catching filtered morning shadows.',
    },
    gallery: [
      {
        src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
        alt: 'Interior travertine island and oak cabinets',
        caption: 'Bespoke kitchen opening directly to outdoor dining terrace.',
      },
      {
        src: '/src/assets/images/category_laneway_suite_1795265798274.jpg',
        alt: 'Garden suite exterior at twilight',
        caption: 'Warm cedar exterior nestled among mature garden plantings.',
      },
    ],
    isTypologyStudy: true,
    features: [
      'Step-free threshold between kitchen and garden patio',
      'Lime-washed plaster and solid oak surfaces',
      'High-efficiency architectural envelope',
    ],
  },
  {
    id: 'rh-movable-ridge-retreat',
    slug: 'ridge-view-movable-residence',
    title: 'Ridge-View Movable Residence',
    category: 'Movable Houses',
    shortDescription:
      'Adaptable two-bay modular architecture designed for rural retreats, seasonal living, or primary homesteads.',
    description:
      'A serene movable dwelling engineered to transition effortlessly across landscapes. Standing-seam roofing and recessed timber soffits shield wide glass apertures from summer glare while welcoming low winter sun.',
    heroImage: {
      src: '/src/assets/images/category_movable_house_1795265797908.jpg',
      alt: 'Movable architectural residence with expansive glass wall and timber deck',
      caption: 'Clean roof overhang and wrap-around outdoor living platform.',
    },
    gallery: [
      {
        src: '/src/assets/images/category_movable_house_1795265797908.jpg',
        alt: 'Movable residence in open landscape',
        caption: 'Site-adaptable architecture with elevated cedar deck.',
      },
      {
        src: '/src/assets/images/interior_courtyard_detail_1795265798668.jpg',
        alt: 'Warm oak interior kitchen detail',
        caption: 'Integrated oak storage and honed stone surfaces.',
      },
    ],
    isTypologyStudy: true,
    features: [
      'All-season insulated envelope for Canadian climates',
      'Wrap-around elevated cedar deck',
      'Transport-ready structural geometry',
    ],
  },
];

export function getPropertyByIdOrSlug(idOrSlug: string): PropertyRecord | undefined {
  return PROPERTY_PORTFOLIO.find(
    (item) => item.id === idOrSlug || item.slug === idOrSlug
  );
}

export function getCategorySlug(category: PropertyCategory): string {
  const match = CATEGORY_OVERVIEWS.find((c) => c.category === category);
  return match ? match.slug : 'all';
}

export function getCategoryFromSlug(slug: string | null): PropertyCategory | 'All' {
  if (!slug || slug === 'all') {
    return 'All';
  }
  const match = CATEGORY_OVERVIEWS.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );
  return match ? match.category : 'All';
}
