import { modules } from '../../types/commons/moduleTypes';
type Section = {
    start: number;
    end: number | null;
};
type Structure = Record<string, Section>;
export declare class useValidation {
    private module?;
    private configData;
    private rawData;
    private SheetNames;
    private headerSectionSheets;
    private headerVariablesSheets;
    constructor(module?: modules);
    getModule(): modules | undefined;
    setModule(module: modules): void;
    validation(file: File): Promise<{
        mapping: any;
        module: any;
    }>;
    private converterXlstoJson;
    private sheetValidation;
    private validationAccordingModule;
    formatSectionStructure(data: any): Record<string, Section>;
    mapDataWithKeys(data: any, keys: any, structure: Structure): Record<string, Record<string, string>>;
}
export {};
