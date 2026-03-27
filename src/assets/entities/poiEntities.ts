export interface PoiCreateDto {
    name: string;
    isLocalized: boolean;
    address: string;
    latitude: number;
    longitude: number;
    constructionCentury: string;
    areaGroup: string;
    generalDescription: string;
    currentStatus: string;
    bibliography: string;
    coverImageUrl: string;
    architectIds: string[];
}

export interface Poi {
    uuid: string;
    name: string;
    localized: boolean;
    address: string;
    latitude: number;
    longitude: number;
    constructionCentury: string;
    areaGroup: string;
    generalDescription: string;
    currentStatus: string;
    bibliography: string;
    coverImageUrl: string;
    architects: string[];
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;  // pagina corrente
    size: number;
}

export const arraySecoli: string[] = [
    'XVI',  // 1500
    'XVII', // 1600
    'XVIII' // 1700
];

export const gruppiArea: string[] = [
    'San Mandato',
    'Cesarea',
    'Le Gradelle',
    'Ponte di Gesù e Maria',
    'Salute',
    'Due Porte',
    'Torricchio',
    'Babbulia'
];
