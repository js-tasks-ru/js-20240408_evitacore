/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    let properties = path.split('.');
  
    return function (obj) {
        if (Object.keys(obj).length === 0) return;

        let value = obj;
        for (const prop of properties) {
            value = value[prop];
          }
        return value;
    }
}
