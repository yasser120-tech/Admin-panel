const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: 'yasserTechSecretKey',
  resave: false,
  saveUninitialized: true
}));

// Single admin credentials
// Password hashed for 'admin123'
const adminUser = {
  username: 'yasser tech',
  passwordHash: '$2b$10$Tk2k6EH6ZJpfsd1/GkzXCOB75SrtHBm2Qh.6F2nAZK4YwzUedL/KC'
};

// Dummy data
let data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

// Middleware ya authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
}

// Routes
app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username) {
    const match = await bcrypt.compare(password, adminUser.passwordHash);
    if (match) {
      req.session.user = username;
      return res.redirect('/dashboard');
    }
  }
  res.render('login', { error: 'Invalid credentials' });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user, data });
});

app.post('/add', isAuthenticated, (req, res) => {
  const { name, email } = req.body;
  const id = Date.now();
  data.push({ id, name, email });
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.redirect('/dashboard');
});

app.post('/delete/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  data = data.filter(item => item.id !== id);
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
