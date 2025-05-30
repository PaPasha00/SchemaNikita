export interface Company {
  id: string;
  company: string;
  description: string;
  year: string;
  links?: string[];  // Optional array of links
}

export interface SourceType {
  type: string;
  companies: Company[];
}

export interface CountryData {
  country: string;
  types: SourceType[];
}

export interface ProjectData {
  name: string;
  countries: CountryData[];
}