const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usuarios simulados (en un proyecto real estarían en una base de datos)
const users = [
  {
    id: 1,
    email: 'estudiante@keyinstitute.edu.sv',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4Lm7W3j7g6', // password
    name: 'Mike B',
    role: 'estudiante',
    carnet: 'KEY_000000',
    carrera: 'Ingeniería Mecatronica y Robotica',
    ciclo: 'Ciclo 01'
  },
  {
    id: 2,
    email: 'supervisor@keyinstitute.edu.sv',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4Lm7W3j7g6', // password
    name: 'Miguel Batres',
    role: 'supervisor',
    carnet: 'SUP_000001',
    carrera: 'Supervisor',
    ciclo: 'N/A'
  },
  {
    id: 3,
    email: 'admin@keyinstitute.edu.sv',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4Lm7W3j7g6', // password
    name: 'Administrador',
    role: 'admin',
    carnet: 'ADM_000002',
    carrera: 'Administración',
    ciclo: 'N/A'
  }
];

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Respuesta sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
});

// Verificar token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Token no proporcionado' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      valid: true, 
      user: userWithoutPassword 
    });

  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
});

// Logout (solo para documentación, JWT es stateless)
router.post('/logout', (req, res) => {
  res.json({ 
    message: 'Logout exitoso' 
  });
});

module.exports = router;
