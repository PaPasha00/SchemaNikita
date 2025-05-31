export interface Company {
  id: string;
  company: string;
  description: string;
  year: string;
  stream?: string;
  links?: string[];  // Optional array of links
  originalCountry?: string; // Оригинальная страна для компаний из группы Европа
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