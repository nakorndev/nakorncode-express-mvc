const path = require('path')
const fs = require('fs').promises
const _ = require('lodash')
const validator = require('validator').default
const sharp = require('sharp')
const { ObjectID } = require('mongodb')

const mongoClient = require('../database/mongo-client')
const users = mongoClient.db('my-first-project').collection('users')
const departments = require('./departments')

module.exports = {
  async getAll (options = {}) {
    const cursor = await users.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId', // users.departmentId
          foreignField: '_id', // departments._id
          as: 'department' // save <---
        }
      },
      { 
        $match: options.condition || {}
      },
      {
        $unwind: '$department'
      },
      {
        $skip: options.offset || 0
      },
      {
        $limit: options.perPage || 30
      }
    ])
    const list = await cursor.toArray()
    return list
  },

  async findById (id) {
    if (!validator.isMongoId(id)) {
      throw new Error('validate_incorrect_user_id')
    }
    const user = await users.findOne({ _id: new ObjectID(id) })
    if (!user) {
      throw new Error('user_not_found')
    }
    return user
  },

  async findByIdWithDepartment (id) {
    if (!validator.isMongoId(id)) {
      throw new Error('validate_incorrect_user_id')
    }
    const cursor = await users.aggregate([
      { 
        $match: { _id: new ObjectID(id) }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId', // users.departmentId
          foreignField: '_id', // departments._id
          as: 'department' // save <---
        }
      },
      {
        $unwind: '$department'
      }
    ])
    const user = await cursor.toArray()
    if (!user.length) {
      throw new Error('user_not_found')
    }
    return user[0]
  },

  fieldToAddOrUpdate: ['firstName', 'lastName', 'age', 'salary', 'skills', 'department'],

  async validateAddOrUpdate (body) {
    const selectedBody = _.pick(body, this.fieldToAddOrUpdate) // object
    if (_.compact(Object.values(selectedBody)).length != 6) {
      throw new Error('validate_incorrect_count_field')
    }

    selectedBody.age = Number(selectedBody.age)
    selectedBody.salary = Number(selectedBody.salary)
    if (Number.isNaN(selectedBody.age) || Number.isNaN(selectedBody.salary)) {
      throw new Error('validate_incorrect_nan')
    }

    selectedBody.skills = Array.isArray(selectedBody.skills) ? selectedBody.skills : [ selectedBody.skills ]

    const ids = await departments.getAllOnlyId()
    selectedBody.departmentId = Number(selectedBody.department)
    delete selectedBody.department
    if (!ids.includes(selectedBody.departmentId)) {
      throw new Error('validate_incorrect_include_departments')
    }

    return selectedBody
  },

  async uploadAvatar (userId, file) {
    if (!userId instanceof ObjectID) {
      // data instanceof Class
      throw new Error('validate_incorrect_user_id')
    }
    if (!file.path) {
      throw new Error('validate_incorrect_file')
    }
    const avatarSubPath = `/avatars/${userId}.jpg`
    const avatarPath = path.resolve(__dirname, `../static/${avatarSubPath}`)
    const buffer = await fs.readFile(file.path)
    await sharp(buffer)
      .resize(150, 150)
      .jpeg({ quality: 90 })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(avatarPath)
    await fs.rm(file.path)
    await users.updateOne({ _id: userId }, { $set: { avatarUrl: avatarSubPath } })
  },

  async add (body) {
    const selectedBody = await this.validateAddOrUpdate(body)
    const user = await users.insertOne(selectedBody)
    return user
  },

  async updateById (id, body) {
    if (!validator.isMongoId(id)) {
      throw new Error('validate_incorrect_user_id')
    }
    const selectedBody = await this.validateAddOrUpdate(body)
    await users.updateOne(
      { _id: new ObjectID(id) },
      { $set: selectedBody }
    )
    return id
  },

  async dismissById (id) {
    if (!validator.isMongoId(id)) {
      throw new Error('validate_incorrect_user_id')
    }
    await users.updateOne(
      { _id: new ObjectID(id) },
      { $set: { terminationDate: new Date() } }
    )
    return id
  }
}
