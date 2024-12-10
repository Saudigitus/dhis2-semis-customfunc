import Excel from 'exceljs'
import { saveAs } from 'file-saver'
import { alignment, border, dataValidation, fill, lock } from '../../../utils/exporterSettings/exporterConsts';
import metadataHeaders from '../../../utils/constants/metadataHeaders.json'
import { excelProps } from '../../../types/bulk/bulkOperations';
import { separateByMonth } from '../../../utils/attendance/separateByMonth';
import { dfHeaders } from '../../../utils/constants/dfHeaders';
import { modules } from '../../../types/common/moduleTypes';
import { generateValidationSheet } from '../../../utils/common/generateValidationSheet';
import { convertNumberToLetter } from '../../../utils/common/convertNumberToLetter';

export function generateFile({ unavailableDays }: { unavailableDays: (date: Date) => boolean }) {
    const password = '#saudigitus_SEMIS_Export#'

    async function excelGenerator(props: excelProps) {
        let sheet: any = {};
        const regex = /^\d{4}-\d{2}-\d{2}$/
        const workbook = new Excel.Workbook();
        const { headers, rows, filters, fileName, metadata, module, empty, defaultLockedHeaders } = props
        const workSheets = { ...(module === modules.attendance ? separateByMonth(headers.find(x => x.name === 'Attendance').headers) : { [module]: module }) }
        const { validationHeaders, validationRows } = generateValidationSheet(filters)

        let validationSheet = workbook.addWorksheet('Validation', { state: 'veryHidden' })
        validationSheet.columns = validationHeaders;
        validationRows.map((row: any) => validationSheet.addRow(row))
        validationSheet.protect(password, lock)

        Object.keys(workSheets).map((workSheet) => {
            let columns: any = [], colIndex = 1, counter = 0
            sheet = workbook.addWorksheet(workSheet)

            headers.forEach(section => {
                (section.name == 'Attendance' ? workSheets[workSheet] : section.headers).forEach((headerInfo: any) => {
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
            thirdRow.values = columns.map((x: any) => x.key)
            thirdRow.hidden = true
            thirdRow.eachCell((cell: any) => {
                cell.protection = { locked: true };
            });

            let secondRow = sheet.getRow(2);
            secondRow.values = columns.map((col: any) => col.subHeader);

            // Merge cells in the first row for headers with multiple subheaders 
            headers.forEach(section => {
                const mergeCount = (section.name == 'Attendance' ? workSheets[workSheet] : section.headers).length;

                if (mergeCount > 1) {
                    sheet.mergeCells(1, colIndex, 1, colIndex + mergeCount - 1);
                }

                const cell = sheet.getCell(1, colIndex);
                cell.fill = { fgColor: { argb: section.fill }, ...fill as unknown as any }
                cell.border = border as unknown as any
                cell.font = { bold: true };
                cell.alignment = alignment as unknown as any;

                colIndex += mergeCount;
            });

            headers.map((section) => {
                (section?.name == 'Attendance' ? workSheets[workSheet] : section.headers).map(() => {
                    counter++

                    const cell = secondRow.getCell(counter);
                    cell.fill = { fgColor: { argb: section.fill }, ...fill as unknown as any }
                    cell.border = border as unknown as any
                    cell.font = { bold: true };
                })
            })

            rows.map(row => sheet.addRow(row))

            sheet.getRow(2).eachCell((headerCell: any, colIndex: number) => {
                const columnHeader = headerCell.value;
                const colKey = sheet.getColumn(colIndex)._key
                const index = dfHeaders.findIndex((x: any) => x.key === colKey)

                if (index !== -1 || colKey === 'dataElements') {
                    const col = sheet.getColumn(colIndex)
                    col.hidden = true
                }

                sheet.eachRow((row: any, index: number) => {
                    const dataElementId = colKey.split(".")
                    const cell = row.getCell(colIndex);

                    if (index > 2) {
                        if (empty && colKey != 'ref') cell.protection = { locked: false }
                        else if (!empty && !defaultLockedHeaders.includes(cell._column._header)) cell.protection = { locked: false }
                    }

                    if (filters?.[dataElementId[0]] || filters?.[dataElementId[1]] || (regex.test(columnHeader) && filters["Attendance"])) {
                        if (index > 2) {
                            const colFilter = filters?.[dataElementId[1]] ?? filters?.[dataElementId[0]] ?? filters["Attendance"]
                            const columnLetter = convertNumberToLetter(validationSheet.getColumn(regex.test(columnHeader) ? 'Attendance' : dataElementId?.[1] ?? dataElementId?.[0]).number);
                            const formula = `'${validationSheet.name}'!$${columnLetter}$2:$${columnLetter}$${colFilter.split(',').length + 1}`;

                            cell.dataValidation = { ...dataValidation, formulae: [formula] };
                        }
                    }
                });
            });

            if (module === modules.attendance)
                sheet.eachRow({ includeEmpty: true }, (row: any) => {
                    row.eachCell({ includeEmpty: true }, (cell: any) => {
                        if (regex.test(cell._column._key) && cell._row._number > 3) {
                            if (unavailableDays != undefined && unavailableDays(new Date(cell._column._key))) {

                                cell.dataValidation = null
                                cell.value = 'Non School Day'
                                cell.fill = { fgColor: { argb: 'f8f9fa' }, ...fill as unknown as any }
                                cell.border = border as unknown as any
                                cell.font = { size: 10 };

                            } else cell.protection = { locked: false };
                        } else if (cell._row._number > 3) {
                            cell.fill = { fgColor: { argb: 'f8f9fa' }, ...fill as unknown as any }
                            cell.border = border as unknown as any
                        }
                    });
                });

            sheet.protect(password, lock);
        })

        sheet = workbook.addWorksheet('Metadata')
        sheet.columns = metadataHeaders
        metadata.map((row: any) => sheet.addRow(row))
        sheet.protect(password, lock)

        const buf = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buf]), fileName + ".xlsx")
    }

    return { excelGenerator }
}