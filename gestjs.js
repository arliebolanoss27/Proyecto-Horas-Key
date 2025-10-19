// Agregar nuevo proyecto a usuario
app.post('/api/user/:id/projects', (req, res) => {
    const userId = req.params.id;
    const { name, description, total_hours, start_date, supervisor } = req.body;

    db.run(`INSERT INTO projects (user_id, name, description, total_hours, start_date, supervisor) 
           VALUES (?, ?, ?, ?, ?, ?)`,
           [userId, name, description, total_hours, start_date, supervisor],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear proyecto' });
            }

            res.json({ 
                success: true, 
                message: 'Proyecto creado exitosamente',
                projectId: this.lastID 
            });
        });
});

// Actualizar horas de proyecto
app.put('/api/projects/:id/hours', (req, res) => {
    const projectId = req.params.id;
    const { hours_completed } = req.body;

    db.run(`UPDATE projects SET hours_completed = ? WHERE id = ?`,
           [hours_completed, projectId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar horas' });
        }

        res.json({ success: true, message: 'Horas actualizadas exitosamente' });
    });
});

// Obtener todos los proyectos disponibles
app.get('/api/projects/available', (req, res) => {
    const availableProjects = [
        {
            id: 'math-tutoring',
            name: 'Apoyo Escolar en Matemáticas',
            description: 'Brindar tutorías de matemáticas a estudiantes de secundaria con dificultades académicas en zonas vulnerables.',
            total_hours: 30,
            supervisor: 'Prof. González',
            volunteers_needed: 5,
            status: 'available'
        },
        {
            id: 'recycling-program',
            name: 'Programa de Reciclaje Comunitario',
            description: 'Implementar un sistema de reciclaje en comunidades urbanas y educar sobre prácticas sostenibles de manejo de residuos.',
            total_hours: 40,
            supervisor: 'Dra. Martínez',
            volunteers_needed: 8,
            status: 'available'
        },
        {
            id: 'digital-literacy',
            name: 'Alfabetización Digital para Adultos Mayores',
            description: 'Enseñar habilidades digitales básicas a adultos mayores para mejorar su inclusión digital y comunicación con familiares.',
            total_hours: 40,
            supervisor: 'Dra. Rodríguez',
            volunteers_needed: 6,
            status: 'available'
        }
    ];

    res.json(availableProjects);
});