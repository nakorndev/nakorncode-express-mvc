const users = require('../../models/users')

module.exports = async (req, res) => {
  const userId = await users.updateById(req.params.id, req.body)
  if (req.file) {
    await users.uploadAvatar(userId, req.file)
  }
  return res.redirect(`/users/${userId}`)
}
