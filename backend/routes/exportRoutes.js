const express = require("express");
const router = express.Router();
const { Parser } = require("json2csv");
const Post = require("../models/Post");

router.get("/csv", async (req, res) => {
  try {
    const posts = await Post.find();

    const fields = [
      "platform",
      "username",
      "title",
      "content",
      "sentiment",
      "category",
      "engagement"
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(posts);

    res.header("Content-Type", "text/csv");
    res.attachment("posts.csv");

    return res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "CSV export failed" });
  }
});

module.exports = router;