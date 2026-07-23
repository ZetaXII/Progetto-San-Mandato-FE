export enum SourceTypeEnum {
    PARIEGETICA = 'PARIEGETICA',
    LETTERARIA = 'LETTERARIA',
    ARCHIVISTICA = 'ARCHIVISTICA'
}

export interface Source {
    uuid: string;
    titolo: string;
    tipologia: SourceTypeEnum;
    riferimento: string;
    secolo: string | null;
    anno: number | null;
    trascrizione: string;
}