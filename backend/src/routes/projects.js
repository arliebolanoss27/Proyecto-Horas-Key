const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Datos simulados de proyectos
const projects = [
  {
    id: 1,
    name: 'Alfabetización Digital para Adultos Mayores',
    description: 'Enseñar habilidades digitales básicas a adultos mayores para mejorar su inclusión digital y comunicación con familiares.',
    supervisor: 'Dra. Elena Rodríguez',
    startDate: '2023-08-15',
    endDate: '2023-12-15',
    status: 'active',
    hoursCompleted: 25,
    hoursTotal: 40,
    progress: 63,
    location: 'Centro Comunitario Norte',
    volunteers: 8,
    requirements: 'Conocimientos básicos de informática, paciencia y empatía'
  },
  {
    id: 2,
    name: 'Huerto Comunitario Sostenible',
    description: 'Desarrollo y mantenimiento de un huerto comunitario para promover la seguridad alimentaria y educación ambiental.',
    supervisor: 'Ing. Laura Silva',
    startDate: '2023-09-10',
    endDate: '2024-03-10',
    status: 'active',
    hoursCompleted: 15,
    hoursTotal: 30,
    progress: 50,
    location: 'Parque Central',
    volunteers: 12,
    requirements: 'Interés en agricultura, trabajo en equipo, condición física básica'
  },
  {
    id: 3,
    name: 'Apoyo Escolar en Matemáticas',
    description: 'Brindar tutorías de matemáticas a estudiantes de secundaria con dificultades académicas en zonas vulnerables.',
    supervisor: 'Prof. González',
    startDate: '2023-10-05',
    endDate: '2024-01-05',
    status: 'pending',
    hoursCompleted: 5,
    hoursTotal: 30,
    progress: 17,
    location: 'Escuela Secundaria Norte',
    volunteers: 5,
    requirements: 'Conocimientos sólidos en matemáticas, paciencia con estudiantes'
  }
];

// Obtener todos los proyectos
router.get('/', authenticateToken, (req, res) => {
  res.json({
    message: 'Proyectos obtenidos exitosamente',
    projects,
    total: projects.length
  });
});

// Obtener proyecto específico
router.get('/:id', authenticateToken, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({ 
      error: 'Proyecto no encontrado' 
    });
  }

  res.json({
    message: 'Proyecto obtenido exitosamente',
    project
  });
});

// Crear nuevo proyecto (solo para administradores)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Solo administradores pueden crear proyectos.' 
    });
  }

  const {
    name,
    description,
    supervisor,
    startDate,
    endDate,
    hoursTotal,
    location,
    requirements
  } = req.body;

  if (!name || !description || !supervisor || !hoursTotal) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos' 
    });
  }

  const newProject = {
    id: projects.length + 1,
    name,
    description,
    supervisor,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || null,
    status: 'pending',
    hoursCompleted: 0,
    hoursTotal: parseInt(hoursTotal),
    progress: 0,
    location: location || '',
    volunteers: 0,
    requirements: requirements || ''
  };

  projects.push(newProject);

  res.status(201).json({
    message: 'Proyecto creado exitosamente',
    project: newProject
  });
});

module.exports = router;
