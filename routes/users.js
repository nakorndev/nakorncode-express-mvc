const path = require('path')
const multer = require('multer')
const uploadAvatar = multer({ dest: path.resolve(__dirname, '../temp') })

const router = require('express-async-router').AsyncRouter()

router.get('/', require('../controllers/users/index'))
router.get('/create', require('../controllers/users/create'))
router.post('/', uploadAvatar.single('avatar'), require('../controllers/users/add'))
router.get('/:id', require('../controllers/users/show'))
router.get('/:id/edit', require('../controllers/users/edit'))
router.put('/:id', uploadAvatar.single('avatar'), require('../controllers/users/update'))
router.delete('/:id', require('../controllers/users/delete'))

module.exports = router
