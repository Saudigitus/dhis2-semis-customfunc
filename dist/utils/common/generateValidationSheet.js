export function generateValidationSheet(options) {
    var _a;
    const keys = Object.keys(options);
    let validationRows = [];
    let headers = [];
    for (const key of keys) {
        const values = options[key].split(',').map((item) => item.trim());
        headers.push({
            header: key,
            key: key,
            width: '20',
        });
        for (let index = 0; index < values.length; index++) {
            validationRows[index] = Object.assign(Object.assign({}, ((_a = validationRows[index]) !== null && _a !== void 0 ? _a : {})), { [key]: values[index] });
        }
    }
    return { validationRows, validationHeaders: headers };
}
