export function getFilterLables(options) {
    let filter = "";
    options.map((option) => {
        filter += option.value + ",";
    });
    return filter.substring(0, filter.length - 1);
}
