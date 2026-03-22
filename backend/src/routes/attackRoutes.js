const express = require("express");
const router = express.Router();

const sqlDetector = require("../middleware/sqlDetector");
const sqlController = require("../controllers/sqlController");
const logController= require("../controllers/logController");

router.post("/sql", sqlDetector, sqlController.detect);
router.get("/sql/logs", logController.getLogs);

module.exports = router;
