export type PropertyCategory =
  | 'Plexes'
  | 'Laneway Houses & Garden Suites'
  | 'Movable Houses';

export interface PropertySpecification {
  label: string;
  value: string;
}

export interface PropertyImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface PropertyRecord {
  id: string;
  slug: string;
  title: string;
  category: PropertyCategory;
  shortDescription: string;
  description: string;
  heroImage: PropertyImage;
  gallery: PropertyImage[];
  /**
   * True when this entry represents an architectural typology showcase rather than
   * an active verified property listing with live pricing/address.
   */
  isTypologyStudy: boolean;
  /** Optional fields: populated only when verified property data is supplied */
  location?: string;
  budgetOrPrice?: string;
  features?: string[];
  specifications?: PropertySpecification[];
}

export interface CategoryOverview {
  category: PropertyCategory;
  slug: string;
  title: string;
  summary: string;
  architecturalFocus: string;
  image: PropertyImage;
}
