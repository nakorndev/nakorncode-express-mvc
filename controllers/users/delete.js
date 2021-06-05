const users = require('../../models/users')

module.exports = async (req, res) => {
  await users.dismissById(req.params.id)
  return res.redirect('/users')
}
