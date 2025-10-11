const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Datos simulados de usuarios
const users = [
  {
    id: 1,
    email: 'estudiante@keyinstitute.edu.sv',
    name: 'Mike B',
    role: 'estudiante',
    carnet: 'KEY_000000',
    carrera: 'Ingeniería Mecatronica y Robotica',
    ciclo: 'Ciclo 01',
    horasCompletadas: 45,
    horasRequeridas: 80,
    horasAprobadas: 35,
    horasPendientes: 10
  }
];

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'Usuario no encontrado' 
    });
  }

  res.json({
    message: 'Perfil obtenido exitosamente',
    user
  });
});

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, (req, res) => {
  const { name, carrera, ciclo } = req.body;
  const userIndex = users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      error: 'Usuario no encontrado' 
    });
  }

  // Actualizar datos
  if (name) users[userIndex].name = name;
  if (carrera) users[userIndex].carrera = carrera;
  if (ciclo) users[userIndex].ciclo = ciclo;

  res.json({
    message: 'Perfil actualizado exitosamente',
    user: users[userIndex]
  });
});

module.exports = router;
