export const formatStringToLowerCase = (text: string = ""): string => {
    return text?.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
}

export const formatStringToTitleCase = (text: string = "") => {
    const result = text?.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

export function capitalizeString(text: string = ""): string {
    return text?.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}