import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as captures from '../repo/captures'

beforeEach(resetDb)

describe('capture lifecycle', () => {
  it('flows from create -> getUnprocessed -> markProcessed', async () => {
    const item = await captures.create('Buy milk')

    let unprocessed = await captures.getUnprocessed()
    expect(unprocessed.map((i) => i.id)).toContain(item.id)

    await captures.markProcessed(item.id, { type: 'task', id: 'task-1' })

    unprocessed = await captures.getUnprocessed()
    expect(unprocessed.map((i) => i.id)).not.toContain(item.id)
  })

  it('excludes soft-deleted captures from getUnprocessed', async () => {
    const item = await captures.create('Temporary thought')
    await captures.softDelete(item.id)

    const unprocessed = await captures.getUnprocessed()
    expect(unprocessed.map((i) => i.id)).not.toContain(item.id)
  })
})
