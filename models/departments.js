const mongoClient = require('../database/mongo-client')
const departments = mongoClient.db('my-first-project').collection('departments')

module.exports = {
  async getAll () {
    const cursor = await departments.find()
    const list = await cursor.toArray()
    return list
  },
  async getAllOnlyId () {
    const cursor = await departments.aggregate([
      { $project: { name: 0, short: 0, describe: 0 } }
    ])
    const list = await cursor.toArray()
    return list.map(v => v._id)
  }
}
