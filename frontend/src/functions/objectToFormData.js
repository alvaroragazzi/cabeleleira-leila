const objectToFormData = (obj, formData, parentKey) => {
    formData = formData || new FormData();
    parentKey = parentKey || "";

    for (let key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== "null" && typeof(obj[key]) != "undefined") {
            const value = obj[key];
            const prefixedKey = parentKey ? `${parentKey}[${key}]` : key;

            if (typeof value === "object" && !(value instanceof File)) {
                objectToFormData(value, formData, prefixedKey);
            } else if (value instanceof File) {
                formData.append(prefixedKey, value);
            } else {
                formData.append(prefixedKey, value);
            }
        }
    }

    return formData;
}

export default objectToFormData;