const users = require('../../models/users')

module.exports = async (req, res) => {
  const user = await users.add(req.body)
  const userId = user.insertedId
  if (req.file) {
    console.log(userId)
    await users.uploadAvatar(userId, req.file)
  }
  return res.redirect(`/users/${userId}`)
}
