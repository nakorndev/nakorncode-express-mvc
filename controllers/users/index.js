const users = require('../../models/users')

module.exports = async (req, res) => {
  const page = Number(req.query.page) || 1
  const perPage = Number(req.query.per_page) || 30
  const offset = (page - 1) * perPage
  const cond = {}
  if (req.query.first_name) {
    cond.firstName = req.query.first_name
  }
  if (req.query.terminated == 'yes') {
    cond.terminationDate = { $ne: null } 
  }
  if (req.query.terminated == 'no') {
    cond.terminationDate = null
  }
  if (req.query.age_lt) {
    cond.age = { $lte: Number(req.query.age_lt) }
  }
  if (req.query.age_gt) {
    const qy = { $gte: Number(req.query.age_gt) }
    if (typeof cond.age == 'object') {
      Object.assign(cond.age, qy)
    } else {
      cond.age = qy
    }
  }
  if (req.query.age) {
    cond.age = Number(req.query.age)
  }
  if (req.query.skills?.length) {
    const value = Array.isArray(req.query.skills)
      ? req.query.skills
      : [ req.query.skills ]
    cond.skills = { $all: value }
  }
  if (req.query.departments?.length) {
    const value = Array.isArray(req.query.departments)
      ? req.query.departments
      : [ req.query.departments ]
    cond.$or = value.map(v => {
      return { 'department.short': v }
    })
  }
  if (!Array.isArray(req.query.skills)) {
    req.query.skills = []
  }
  if (!Array.isArray(req.query.departments)) {
    req.query.departments = []
  }
  const list = await users.getAll({
    condition: cond,
    offset,
    perPage
  })
  return res.render('users-index.pug', {
    users: list,
    query: req.query,
    skills: Array.isArray(req.query.skills)
      ? req.query.skills
      : [ req.query.skills ]
  })
}
