const usersController = require("../controllers/users.controller");
const { isAuth } = require("../middleware/isAuth.middleware");

const router = require("express").Router();

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/", isAuth, usersController.users);
router.get("/:id", isAuth, usersController.usersById);
router.patch("/update/:id", isAuth, usersController.updateUser);
router.delete("/delete/:id", isAuth, usersController.deleteUser);

module.exports = router;
