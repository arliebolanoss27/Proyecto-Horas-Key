const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Datos simulados de horas registradas
const hours = [
  {
    id: 1,
    userId: 1,
    projectId: 1,
    date: '2023-10-15',
    hours: 4,
    activity: 'Taller de reciclaje comunitario',
    description: 'Organización y ejecución de jornada de limpieza',
    status: 'approved'
  },
  {
    id: 2,
    userId: 1,
    projectId: 1,
    date: '2023-10-12',
    hours: 6,
    activity: 'Clases de informática para adultos mayores',
    description: 'Enseñanza de uso básico de computadoras',
    status: 'approved'
  },
  {
    id: 3,
    userId: 1,
    projectId: 2,
    date: '2023-10-08',
    hours: 5,
    activity: 'Mantenimiento del huerto escolar',
    description: 'Siembra y cuidado de plantas comunitarias',
    status: 'approved'
  },
  {
    id: 4,
    userId: 1,
    projectId: 3,
    date: '2023-10-05',
    hours: 3,
    activity: 'Tutorías de matemáticas',
    description: 'Apoyo escolar en matemáticas básicas',
    status: 'pending'
  }
];

// Obtener horas del usuario autenticado
router.get('/', authenticateToken, (req, res) => {
  const userHours = hours.filter(h => h.userId === req.user.id);
  
  // Calcular totales
  const totalHours = userHours.reduce((sum, h) => sum + h.hours, 0);
  const approvedHours = userHours
    .filter(h => h.status === 'approved')
    .reduce((sum, h) => sum + h.hours, 0);
  const pendingHours = userHours
    .filter(h => h.status === 'pending')
    .reduce((sum, h) => sum + h.hours, 0);

  res.json({
    message: 'Horas obtenidas exitosamente',
    hours: userHours,
    summary: {
      total: totalHours,
      approved: approvedHours,
      pending: pendingHours,
      remaining: 80 - approvedHours // Horas requeridas - horas aprobadas
    }
  });
});

// Registrar nuevas horas
router.post('/', authenticateToken, (req, res) => {
  const { projectId, date, hours: hoursCount, activity, description } = req.body;

  if (!projectId || !date || !hoursCount || !activity) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos' 
    });
  }

  const newHourEntry = {
    id: hours.length + 1,
    userId: req.user.id,
    projectId: parseInt(projectId),
    date,
    hours: parseInt(hoursCount),
    activity,
    description: description || '',
    status: 'pending'
  };

  hours.push(newHourEntry);

  res.status(201).json({
    message: 'Horas registradas exitosamente',
    hourEntry: newHourEntry
  });
});

// Actualizar horas registradas
router.put('/:id', authenticateToken, (req, res) => {
  const hourId = parseInt(req.params.id);
  const hourIndex = hours.findIndex(h => h.id === hourId && h.userId === req.user.id);
  
  if (hourIndex === -1) {
    return res.status(404).json({ 
      error: 'Registro de horas no encontrado' 
    });
  }

  const { date, hours: hoursCount, activity, description } = req.body;

  // Actualizar solo los campos proporcionados
  if (date) hours[hourIndex].date = date;
  if (hoursCount) hours[hourIndex].hours = parseInt(hoursCount);
  if (activity) hours[hourIndex].activity = activity;
  if (description !== undefined) hours[hourIndex].description = description;

  res.json({
    message: 'Horas actualizadas exitosamente',
    hourEntry: hours[hourIndex]
  });
});

// Obtener estadísticas de horas
router.get('/stats', authenticateToken, (req, res) => {
  const userHours = hours.filter(h => h.userId === req.user.id);
  
  // Agrupar por proyecto
  const projectStats = {};
  userHours.forEach(hour => {
    if (!projectStats[hour.projectId]) {
      projectStats[hour.projectId] = {
        projectId: hour.projectId,
        totalHours: 0,
        approvedHours: 0,
        pendingHours: 0
      };
    }
    
    projectStats[hour.projectId].totalHours += hour.hours;
    if (hour.status === 'approved') {
      projectStats[hour.projectId].approvedHours += hour.hours;
    } else if (hour.status === 'pending') {
      projectStats[hour.projectId].pendingHours += hour.hours;
    }
  });

  res.json({
    message: 'Estadísticas obtenidas exitosamente',
    projectStats: Object.values(projectStats)
  });
});

module.exports = router;
