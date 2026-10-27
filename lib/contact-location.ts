export const CONTACT_ADDRESS = 'Shawbriggs, Barrow Road, Goxhill, DN19 7LN'

const locationQuery = encodeURIComponent(CONTACT_ADDRESS)

export const CONTACT_MAP_EMBED_URL = `https://www.google.com/maps?q=${locationQuery}&output=embed`
export const CONTACT_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`
