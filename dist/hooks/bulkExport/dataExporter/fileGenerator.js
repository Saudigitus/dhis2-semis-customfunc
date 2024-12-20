var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import { alignment, border, dataValidation, fill, lock } from '../../../utils/exporterSettings/exporterConsts';
import metadataHeaders from '../../../utils/constants/metadataHeaders.json';
import { separateByMonth } from '../../../utils/attendance/separateByMonth';
import { dfHeaders } from '../../../utils/constants/dfHeaders';
import { modules } from '../../../types/common/moduleTypes';
import { generateValidationSheet } from '../../../utils/common/generateValidationSheet';
import { convertNumberToLetter } from '../../../utils/common/convertNumberToLetter';
export function gererateFile({ unavailableDays }) {
    const password = '#saudigitus_SEMIS_Export#';
    function excelGenerator(props) {
        return __awaiter(this, void 0, void 0, function* () {
            let sheet = {};
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            const workbook = new Excel.Workbook();
            const { headers, rows, filters, fileName, metadata, module, empty, defaultLockedHeaders } = props;
            const workSheets = Object.assign({}, (module === modules.attendance ? separateByMonth(headers.find(x => x.name === 'Attendance').headers) : { [module]: module }));
            const { validationHeaders, validationRows } = generateValidationSheet(filters);
            let validationSheet = workbook.addWorksheet('Validation', { state: 'veryHidden' });
            validationSheet.columns = validationHeaders;
            validationRows.map((row) => validationSheet.addRow(row));
            validationSheet.protect(password, lock);
            Object.keys(workSheets).map((workSheet) => {
                let columns = [], colIndex = 1, counter = 0;
                sheet = workbook.addWorksheet(workSheet);
                headers.forEach(section => {
                    (section.name == 'Attendance' ? workSheets[workSheet] : section.headers).forEach((headerInfo) => {
                        columns.push({
                            header: section.name,
                            key: headerInfo.key,
                            width: headerInfo.width,
                            subHeader: headerInfo.header,
                        });
                    });
                });
                sheet.columns = columns;
                // Add the subheaders to the second row
                let thirdRow = sheet.getRow(3);
                thirdRow.values = columns.map((x) => x.key);
                thirdRow.hidden = true;
                thirdRow.eachCell((cell) => {
                    cell.protection = { locked: true };
                });
                let secondRow = sheet.getRow(2);
                secondRow.values = columns.map((col) => col.subHeader);
                // Merge cells in the first row for headers with multiple subheaders 
                headers.forEach(section => {
                    const mergeCount = (section.name == 'Attendance' ? workSheets[workSheet] : section.headers).length;
                    if (mergeCount > 1) {
                        sheet.mergeCells(1, colIndex, 1, colIndex + mergeCount - 1);
                    }
                    const cell = sheet.getCell(1, colIndex);
                    cell.fill = Object.assign({ fgColor: { argb: section.fill } }, fill);
                    cell.border = border;
                    cell.font = { bold: true };
                    cell.alignment = alignment;
                    colIndex += mergeCount;
                });
                headers.map((section) => {
                    ((section === null || section === void 0 ? void 0 : section.name) == 'Attendance' ? workSheets[workSheet] : section.headers).map(() => {
                        counter++;
                        const cell = secondRow.getCell(counter);
                        cell.fill = Object.assign({ fgColor: { argb: section.fill } }, fill);
                        cell.border = border;
                        cell.font = { bold: true };
                    });
                });
                rows.map(row => sheet.addRow(row));
                sheet.getRow(2).eachCell((headerCell, colIndex) => {
                    const columnHeader = headerCell.value;
                    const colKey = sheet.getColumn(colIndex)._key;
                    const index = dfHeaders.findIndex((x) => x.key === colKey);
                    if (index !== -1 || colKey === 'dataElements') {
                        const col = sheet.getColumn(colIndex);
                        col.hidden = true;
                    }
                    sheet.eachRow((row, index) => {
                        var _a, _b, _c;
                        const dataElementId = colKey.split(".");
                        const cell = row.getCell(colIndex);
                        if (index > 2) {
                            if (empty && colKey != 'ref')
                                cell.protection = { locked: false };
                            else if (!empty && !defaultLockedHeaders.includes(cell._column._header))
                                cell.protection = { locked: false };
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters[dataElementId[0]]) || (filters === null || filters === void 0 ? void 0 : filters[dataElementId[1]]) || (regex.test(columnHeader) && filters["Attendance"])) {
                            if (index > 2) {
                                const colFilter = (_b = (_a = filters === null || filters === void 0 ? void 0 : filters[dataElementId[1]]) !== null && _a !== void 0 ? _a : filters === null || filters === void 0 ? void 0 : filters[dataElementId[0]]) !== null && _b !== void 0 ? _b : filters["Attendance"];
                                const columnLetter = convertNumberToLetter(validationSheet.getColumn(regex.test(columnHeader) ? 'Attendance' : (_c = dataElementId === null || dataElementId === void 0 ? void 0 : dataElementId[1]) !== null && _c !== void 0 ? _c : dataElementId === null || dataElementId === void 0 ? void 0 : dataElementId[0]).number);
                                const formula = `'${validationSheet.name}'!$${columnLetter}$2:$${columnLetter}$${colFilter.split(',').length + 1}`;
                                cell.dataValidation = Object.assign(Object.assign({}, dataValidation), { formulae: [formula] });
                            }
                        }
                    });
                });
                if (module === modules.attendance)
                    sheet.eachRow({ includeEmpty: true }, (row) => {
                        row.eachCell({ includeEmpty: true }, (cell) => {
                            if (regex.test(cell._column._key) && cell._row._number > 3) {
                                if (unavailableDays != undefined && unavailableDays(new Date(cell._column._key))) {
                                    cell.dataValidation = null;
                                    cell.value = 'Non School Day';
                                    cell.fill = Object.assign({ fgColor: { argb: 'f8f9fa' } }, fill);
                                    cell.border = border;
                                    cell.font = { size: 10 };
                                }
                                else
                                    cell.protection = { locked: false };
                            }
                            else if (cell._row._number > 3) {
                                cell.fill = Object.assign({ fgColor: { argb: 'f8f9fa' } }, fill);
                                cell.border = border;
                            }
                        });
                    });
                sheet.protect(password, lock);
            });
            sheet = workbook.addWorksheet('Metadata');
            sheet.columns = metadataHeaders;
            metadata.map((row) => sheet.addRow(row));
            sheet.protect(password, lock);
            const buf = yield workbook.xlsx.writeBuffer();
            saveAs(new Blob([buf]), fileName + ".xlsx");
        });
    }
    return { excelGenerator };
}
