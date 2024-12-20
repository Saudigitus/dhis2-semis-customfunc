import { format } from "date-fns";
export function genarateEmpttyRows(numberOfEmpyRows, headers, ids, school) {
    const vars = headers.map(x => x.headers).flat().map(x => x.key);
    const object = Object.fromEntries(vars.map(key => [key, ""]));
    let sheetData = [];
    for (let index = 0; index < numberOfEmpyRows; index++) {
        const keys = Object.keys(ids);
        let row = Object.assign(Object.assign({}, object), { ref: index + 1, enrollmentDate: format(new Date(), 'yyyy-MM-dd'), school: school });
        for (const key of keys)
            row = Object.assign(Object.assign({}, row), { [key]: ids[key][index] });
        sheetData.push(row);
    }
    return sheetData;
}
