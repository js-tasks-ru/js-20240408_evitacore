/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    let result = '';
    let count = 0;
    let prevChar = '';

    if(size === 0) return result;
    if(size === undefined) return string;

    for(const char of string) {
        if(char === prevChar) {
            count++;
            if(count <= size) {
                result += char;
            }
        } else {
            count = 1;
            prevChar = char;
            result += char;
        }
        
    }
    return result;
}
