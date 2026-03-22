const router = require("express").Router();
const bruteController = require("../controllers/bruteController");

router.post("/login", bruteController.login);

module.exports = router;
