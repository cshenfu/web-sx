const removeEmptyValues = (obj) => {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          var value = obj[key];
          if (typeof value === "undefined" || value === null || value === "") {
            delete obj[key];
          }
        }
      }
      return obj;
}
export {
    removeEmptyValues
}