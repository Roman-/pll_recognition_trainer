import Dexie from 'dexie'
import { migrateLegacySizeOption } from '@/scripts/session_sizing'

const db = new Dexie('pll_trainer')

db.version(1).stores({
    sessions: '++id, completedAt, [poolKey+sizeOption]'
})

db.version(2).stores({
    sessions: '++id, completedAt, [poolKey+sizeOption]'
}).upgrade(tx => {
    return tx.table('sessions').toCollection().modify(session => {
        session.sizeOption = migrateLegacySizeOption(session.sizeOption)
    })
})

export default db
