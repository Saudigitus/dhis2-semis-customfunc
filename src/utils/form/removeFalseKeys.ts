/**
 * 
 * @param obj - a Record<string, any> object 
 * @returns - the received object without the key-value pairs in which the value is falsy
 */
export function removeFalseKeys(obj: Record<string, any>) {
  for (const key in obj) {
    if (obj[key] === false) {
      delete obj[key]; // Remove o objecto a key com o valor false
    }
    if (obj[key] === "") {
      obj[key] = 0
    }
  }
  return obj;
}