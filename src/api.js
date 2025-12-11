export async function uploadLog(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Smelting failed: ${response.statusText}`);
    }

    return await response.json();
}
