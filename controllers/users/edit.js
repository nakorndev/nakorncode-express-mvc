const users = require('../../models/users')

module.exports = async (req, res) => {
  const user = await users.findById(req.params.id)
  return res.render('users-edit.pug', { user })
}
