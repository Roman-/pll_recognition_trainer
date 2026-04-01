import Dexie from 'dexie'

const db = new Dexie('pll_trainer')

db.version(1).stores({
    sessions: '++id, completedAt, [poolKey+sizeOption]'
})

export default db
