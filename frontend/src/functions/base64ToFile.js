export default function base64ToFile(base64, name = "arquivo") {
    let contentType = "application/octet-stream";
    let realData = base64;

    if (!base64 || typeof base64 !== "string") {
        throw new Error("Base64 inválido");
    }

    base64 = base64.trim();

    const hasDataPrefix = base64.startsWith("data:");

    if (hasDataPrefix) {
        const matches = base64.match(/^data:([^;]+);base64,(.+)$/s);

        if (!matches) {
            throw new Error("Data URL base64 inválida");
        }

        contentType = matches[1];
        realData = matches[2];
    } else {
        realData = base64;

        const signature = realData.slice(0, 10);

        if (signature.startsWith("iVBOR")) {
            contentType = "image/png";
        } else if (signature.startsWith("/9j/")) {
            contentType = "image/jpeg";
        } else if (signature.startsWith("R0lGOD")) {
            contentType = "image/gif";
        } else if (signature.startsWith("JVBER")) {
            ontentType = "application/pdf";
        } else if (signature.startsWith("UEsD")) {
            contentType = "application/zip";
        } else if (signature.startsWith("AAABAAEAE")) {
            contentType = "image/x-icon";
        }
    }

    realData = realData.replace(/\s/g, "");
    const extension = contentType?.split("/")[1];

    const byteArray = atob(realData);
    const byteNumbers = new Array(byteArray.length);

    for (let i = 0; i < byteArray.length; i++) {
        byteNumbers[i] = byteArray.charCodeAt(i);
    }

    const byteArrayBuffer = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArrayBuffer], { type: contentType });

    return new File([blob], name.includes(".") ? name : `${name}.${extension}`, { type: contentType });
}