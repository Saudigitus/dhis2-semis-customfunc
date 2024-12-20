var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { modules } from '../../types/commons/moduleTypes';
import { read, utils } from "xlsx";
const METADATA = "Metadata";
const VALIDATION = "Validation";
const Ids = "Ids";
const Attendance = "Attendance";
export class useValidation {
    constructor(module) {
        this.configData = [];
        this.SheetNames = []; //	
        this.headerVariablesSheets = [];
        this.module = module;
    }
    getModule() {
        return this.module;
    }
    setModule(module) {
        this.module = module;
    }
    validation(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                const mappedData = [];
                reader.onload = (event) => {
                    var _a;
                    try {
                        // Parse the uploaded file
                        const data = new Uint8Array((_a = event.target) === null || _a === void 0 ? void 0 : _a.result);
                        const workbook = read(data, {
                            type: 'array',
                            cellDates: true,
                            cellNF: false,
                            dateNF: "YYYY-MM-DD",
                            cellText: true
                        });
                        // Convert Excel to JSON and validate the sheet structure
                        this.converterXlstoJson(workbook);
                        this.sheetValidation(workbook.SheetNames);
                        // Process data 
                        for (let i = 3; i < this.rawData.length; i++) {
                            mappedData.push(this.mapDataWithKeys(this.rawData[i], this.headerVariablesSheets, this.headerSectionSheets));
                        }
                        // Resolve the Promise with the result
                        resolve({
                            mapping: mappedData,
                            module: this.module
                        });
                    }
                    catch (error) {
                        // Reject the Promise in case of any error
                        reject(error);
                    }
                };
                reader.onerror = (error) => {
                    reject(error); // Handle file reading errors
                };
                // Start reading the file as an ArrayBuffer
                reader.readAsArrayBuffer(file);
            });
        });
    }
    converterXlstoJson(workbook) {
        /**
         *
         * Compare the current working module with the attendance module
         */
        var _a, _b, _c, _d, _e, _f;
        if (this.module === modules.attendance) {
            /**
             * Extract all sheet names from the workbook.
             */
            const sheetNames = workbook.SheetNames;
            /**
             * Identify and retrieve the configuration sheet (assumed to be the last sheet).
             */
            const configSheet = workbook.SheetNames[sheetNames.length - 1];
            const configWorksheet = workbook.Sheets[configSheet];
            /**
             * Format the structure of the headers in the first sheet for further processing.
             * This helps to define the start and end positions of different sections (e.g., attendance).
             */
            let headerSectionSheets = this.formatSectionStructure((_a = utils.sheet_to_json(workbook.Sheets[sheetNames[1]], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })) === null || _a === void 0 ? void 0 : _a[0]);
            /**
             * Convert all rows in the first sheet to JSON format.
             */
            const allRawDataOnFirstSheet = utils.sheet_to_json(workbook.Sheets[sheetNames[1]], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" });
            /**
             * Exclude the first sheet and metadata from further processing.
             * Get the names of remaining sheets.
             */
            const newSheetNames = sheetNames.slice(1);
            /**
             * Array to store all additional attendance-related header data from other sheets.
             */
            const allOtherAttendanceHeaderData = [];
            /**
             * Loop through each sheet name in `newSheetNames` and collect attendance-related headers.
             */
            for (const sheetName of newSheetNames) {
                if ((sheetName !== METADATA) && (sheetName !== VALIDATION)) {
                    /**
                     * Format the structure of headers for the current sheet.
                     */
                    const localHeaderSectionSheets = this.formatSectionStructure((_b = utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })) === null || _b === void 0 ? void 0 : _b[0]);
                    /**
                     * Extract the attendance-related header data for the current sheet
                     * based on its start and end indices.
                     */
                    const headerData = utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })[2];
                    const headerDataAttendance = headerData.slice(localHeaderSectionSheets[Attendance].start, localHeaderSectionSheets[Attendance].end);
                    /**
                     * Append the extracted headers to the `allOtherAttendanceHeaderData` array.
                     */
                    allOtherAttendanceHeaderData.push(...headerDataAttendance);
                }
            }
            /**
             * Loop through the rows (starting from the 4th row) in the first sheet to append attendance data.
             */
            for (let i = 3; i < allRawDataOnFirstSheet.length; i++) {
                const allAttendanceData = [];
                let attendanceData = [];
                for (const sheetName of newSheetNames) {
                    if ((sheetName !== METADATA) && (sheetName !== VALIDATION)) {
                        /**
                         * Format the structure of headers for the current sheet.
                         */
                        const localHeaderSectionSheets = this.formatSectionStructure((_c = utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })) === null || _c === void 0 ? void 0 : _c[0]);
                        /**
                         * Extract the attendance data for the current row and append it.
                         */
                        const currentData = utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" });
                        attendanceData = currentData[i].slice(localHeaderSectionSheets[Attendance].start, localHeaderSectionSheets[Attendance].end);
                        allAttendanceData.push(...attendanceData);
                    }
                }
                /**
                 * Insert the attendance data into the current row of the first sheet.
                 */
                allRawDataOnFirstSheet[i].splice(headerSectionSheets[Attendance].end, 0, ...allAttendanceData);
            }
            /**
             * Generate an array of placeholders for new headers, matching the length of additional attendance data.
             */
            const newHeaders = Array(allOtherAttendanceHeaderData.length).fill(""); // Replace "" with actual values if needed
            /**
             * Append placeholders and attendance headers into the first three rows of the first sheet.
             */
            allRawDataOnFirstSheet[0].splice(headerSectionSheets[Attendance].end, 0, ...newHeaders);
            allRawDataOnFirstSheet[1].splice(headerSectionSheets[Attendance].end, 0, ...allOtherAttendanceHeaderData);
            allRawDataOnFirstSheet[2].splice(headerSectionSheets[Attendance].end, 0, ...allOtherAttendanceHeaderData);
            /**
             * Update the end index of the attendance section to reflect the addition of new headers.
             */
            headerSectionSheets[Attendance].end = headerSectionSheets[Attendance].end + allOtherAttendanceHeaderData.length;
            /**
             * Extract the updated attendance header data from the first sheet.
             */
            const attendanceHeaderData = (_d = utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })) === null || _d === void 0 ? void 0 : _d[1];
            attendanceHeaderData.splice(headerSectionSheets[Attendance].end, 0, ...allOtherAttendanceHeaderData);
            /**
             * Update the class-level properties with the processed data.
             */
            this.headerSectionSheets = this.formatSectionStructure(allRawDataOnFirstSheet[0]);
            this.headerVariablesSheets = allRawDataOnFirstSheet[2];
            this.SheetNames = sheetNames;
            this.configData = utils.sheet_to_json(configWorksheet);
            this.rawData = allRawDataOnFirstSheet;
        }
        else {
            /**
             * Get the first sheet in the workbook in cases of single sheet and convert it as a json
             * set to the global variables
             */
            const sheetName = workbook.SheetNames[1];
            const worksheet = workbook.Sheets[sheetName];
            const configSheet = workbook.SheetNames[2];
            const configWorksheet = workbook.Sheets[configSheet];
            this.headerVariablesSheets = (_e = utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })) === null || _e === void 0 ? void 0 : _e[2];
            this.headerSectionSheets = this.formatSectionStructure((_f = utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" })) === null || _f === void 0 ? void 0 : _f[0]);
            this.rawData = utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: "" });
            this.configData = utils.sheet_to_json(configWorksheet);
            this.SheetNames = workbook.SheetNames;
        }
    }
    sheetValidation(sheets) {
        /**
         * Verify that the metadata sheet is present
         * if the metadata sheet is not present, return false and stop the process
         */
        if (!sheets.includes(METADATA)) {
            throw new Error("The metadata sheet is missing");
        }
        /**
         * Verify that there are at least two sheets
         * if there are less than two sheets, return false and stop the process
         */
        if (sheets.length < 2) {
            throw new Error("There are less than two sheets");
        }
        return true;
    }
    validationAccordingModule() {
    }
    formatSectionStructure(data) {
        const structure = {};
        let currentSection = null;
        let startIndex = null;
        data.forEach((value, index) => {
            if (value) {
                // Se já houver uma seção ativa, finalize-a
                if (currentSection !== null) {
                    structure[currentSection].end = index;
                }
                // Iniciar uma nova seção
                currentSection = value;
                startIndex = index;
                structure[currentSection] = { start: startIndex, end: null };
            }
        });
        // Finalizar a última seção, se houver
        if (currentSection !== null) {
            structure[currentSection].end = data.length;
        }
        return structure;
    }
    mapDataWithKeys(data, keys, structure) {
        const mappedData = {};
        for (const section in structure) {
            const { start, end } = structure[section];
            const sectionData = data.slice(start, end);
            const sectionKeys = keys.slice(start, end);
            mappedData[section] = sectionData.reduce((acc, value, index) => {
                acc[sectionKeys[index]] = value;
                return acc;
            }, {});
        }
        return mappedData;
    }
}
