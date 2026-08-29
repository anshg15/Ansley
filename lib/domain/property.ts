export type PropertySource = "manual" | "extracted";

export type DwellingType = string;

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface PropertyAttributes {
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
}

export interface PropertyProfile {
    address: string;
    coordinates?: Coordinates;
    dwellingType?: DwellingType;
    rentPerWeek?: number;
    attributes?: PropertyAttributes;
    source: PropertySource;
}