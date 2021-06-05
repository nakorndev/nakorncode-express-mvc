const _ = require('lodash')
const faker = require('faker')
const { MongoClient } = require('mongodb')

const client = new MongoClient('mongodb://127.0.0.1:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const seed = async () => {
  await client.connect()
  const db = client.db('my-first-project')
  const departmentsCollection = db.collection('departments')
  
  const departments = [
    {
      _id: 1,
      short: 'BE',
      name: 'Back-end developer',
      describe: 'ผู้พัฒนาระบบหลังบ้าน'
    },
    {
      _id: 2,
      short: 'FE',
      name: 'Front-end developer',
      describe: 'ผู้พัฒนาระบบหน้าบ้าน'
    },
    {
      _id: 3,
      short: 'DB',
      name: 'Database manager',
      describe: 'ผู้จัดการฐานข้อมูล'
    },
    {
      _id: 4,
      short: 'AD',
      name: 'Administrator',
      describe: 'ผู้ดูแลหน้าเว็บ'
    },
  ]
  
  await departmentsCollection.insertMany(departments)
  process.exit()
}

seed()
