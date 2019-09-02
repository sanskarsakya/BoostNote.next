import Client from './Client'
import PouchDB from './PouchDB'
import { getFolderId, getTagId } from './utils'

let clientCount = 0
async function createClient(shouldInit: boolean = true): Promise<Client> {
  const id = `dummy${++clientCount}`
  const db = new PouchDB(id, {
    adapter: 'memory'
  })
  const client = new Client(db, id, id)

  if (shouldInit) {
    // await client.init()
  }

  return client
}

describe('Client', () => {
  describe('#getFolder', () => {
    it('returns a folder', async () => {
      // Given
      const client = await createClient()
      const now = new Date().toISOString()
      await client.db.put({
        _id: getFolderId('/test'),
        createdAt: now,
        updatedAt: now,
        data: {}
      })

      // When
      const result = await client.getFolder('/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: now,
        updatedAt: now,
        data: {}
      })
    })

    it('returns null if the folder does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.getFolder('/test')

      // Then
      expect(result).toEqual(null)
    })
  })

  describe('#upsertFolder', () => {
    it('creates a folder if it does not exist yet', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.upsertFolder('/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })

      const doc = await client.db.get(getFolderId('/test'))
      expect(doc).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })
    })

    it('creates parent folder if it does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.upsertFolder('/parent/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/parent/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })

      const doc = await client.db.get(getFolderId('/parent/test'))
      expect(doc).toEqual({
        _id: getFolderId('/parent/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })

      const parentDoc = await client.db.get(getFolderId('/parent'))
      expect(parentDoc).toEqual({
        _id: getFolderId('/parent'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })
    })

    it('updates folder props', async () => {
      // Given
      const client = await createClient()
      await client.upsertFolder('/test')

      // When
      const result = await client.upsertFolder('/test', {
        data: { message: 'yolo' }
      })

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: { message: 'yolo' }
      })

      const doc = await client.db.get(getFolderId('/test'))
      expect(doc).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: { message: 'yolo' }
      })
    })

    it('does NOT update folder props if nothing to change', async () => {
      // Given
      const client = await createClient()
      const { createdAt, updatedAt, _rev } = await client.upsertFolder(
        '/test',
        { data: { message: 'yolo' } }
      )

      // When
      const result = await client.upsertFolder('/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev,
        createdAt,
        updatedAt,
        data: { message: 'yolo' }
      })

      const doc = await client.db.get(getFolderId('/test'))
      expect(doc).toEqual({
        _id: getFolderId('/test'),
        _rev,
        createdAt,
        updatedAt,
        data: { message: 'yolo' }
      })
    })
  })

  describe('#getTag', () => {
    it('returns a tag', async () => {
      // Given
      const client = await createClient()
      const now = new Date().toISOString()
      await client.db.put({
        _id: getTagId('test'),
        createdAt: now,
        updatedAt: now,
        data: {}
      })

      // When
      const result = await client.getTag('test')

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        _rev: expect.any(String),
        createdAt: now,
        updatedAt: now,
        data: {}
      })
    })

    it('returns null if the folder does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.getTag('test')

      // Then
      expect(result).toEqual(null)
    })
  })

  describe('#upsertTag', () => {
    it('creates a tag if it does not exist yet', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.upsertTag('test', {
        data: { message: 'yolo' }
      })

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })

      const doc = await client.getTag('test')
      expect(doc).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })
    })

    it('udpates tag props', async () => {
      // Given
      const client = await createClient()
      await client.upsertTag('test', {
        data: {}
      })

      // When
      const result = await client.upsertTag('test', {
        data: { message: 'yolo' }
      })

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })

      const doc = await client.getTag('test')
      expect(doc).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })
    })

    it('does NOT update tag props if nothing to change', async () => {
      // Given
      const client = await createClient()
      const { createdAt, updatedAt, _rev } = await client.upsertTag('test', {
        data: {
          message: 'yolo'
        }
      })

      // When
      const result = await client.upsertTag('test')

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        createdAt,
        updatedAt,
        _rev,
        data: {
          message: 'yolo'
        }
      })

      const doc = await client.getTag('test')
      expect(doc).toEqual({
        _id: getTagId('test'),
        createdAt,
        updatedAt,
        _rev,
        data: {
          message: 'yolo'
        }
      })
    })

    it('throws when tag name is invalid', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.upsertTag('invalid tag')
      } catch (error) {
        // Then
        expect(error.message).toEqual('tag name is invalid, got `invalid tag`')
      }
    })
  })
})