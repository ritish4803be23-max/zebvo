const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');

router.get('/', postsController.getPosts);
router.get('/search', postsController.searchPosts);
router.get('/filter', postsController.filterPosts);
router.post('/translate', postsController.translatePost);

module.exports = router;
