const router = require('express-async-router').AsyncRouter()

const mongoClient = require('../database/mongo-client')
const departments = mongoClient.db('my-first-project').collection('departments')

router.get('/:id', async (req, res) => {
  const cursor = await departments.aggregate([
    {
      $match: { _id: Number(req.params.id) }
    },
    {
      $lookup: {
        from: 'users',
        // localField: '_id', // departments._id
        // foreignField: 'departmentId', // users.departmentId
        let: { parentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$departmentId', '$$parentId'] // equal (==)
              }
            }
          },
          {
            $match: { terminationDate: null } // unset, null
          }
        ],
        as: 'users' // save <---
      }
    }
  ])
  const department = await cursor.toArray()
  return res.render('departments-show.pug', { department: department[0] })
})

module.exports = router
