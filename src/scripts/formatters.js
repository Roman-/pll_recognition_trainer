export function formatAccuracy(ratio) {
    return (ratio * 100).toFixed(1) + '%'
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export function sessionTypeKey(s) {
    return `${s.poolKey}|${s.sizeOption}`
}
