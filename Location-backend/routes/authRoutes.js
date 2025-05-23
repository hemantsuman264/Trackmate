import express from "express";
import {register, login} from "../controllers/authController.js"

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/login', (req, res) => {
    res.send("Login is working");
  });

  router.get('/register', (req, res) => {
    res.send('Register is working');
  });  

export default router;