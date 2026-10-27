import { format } from "date-fns"

export function generateEmptyRows(numberOfEmptyRows: number, headers: any[], ids: any, school: String) {
    const vars = headers.map(x => x.headers).flat().map(x => x.key)
    const object = Object.fromEntries(vars.map(key => [key, ""]))
    let sheetData: any = []

    for (let index = 0; index < numberOfEmptyRows; index++) {
        const keys = Object.keys(ids)
        let row = { ...object, ref: index + 1, enrollmentDate: format(new Date(), 'yyyy-MM-dd'), school: school }

        for (const key of keys)
            row = { ...row, [key]: ids[key][index] }

        sheetData.push(row)
    }

    return sheetData
}