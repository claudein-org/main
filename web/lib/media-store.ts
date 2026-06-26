const store = new Map<string, { base64: string; contentType: string }>()

export function storeMedia(id: string, base64: string, contentType: string): void {
    store.set(id, { base64, contentType })
}

export function getMedia(id: string) {
    return store.get(id)
}

export function deleteMedia(id: string): void {
    store.delete(id)
}
