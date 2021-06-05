const users = require('../../models/users')

module.exports = async (req, res) => {
  const user = await users.findByIdWithDepartment(req.params.id)
  return res.render('users-show.pug', { user })
}
