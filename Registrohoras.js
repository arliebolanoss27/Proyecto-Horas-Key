// Registrar horas de servicio
app.post('/api/hours', (req, res) => {
    const { user_id, project_id, hours, date, description } = req.body;

    db.run(`INSERT INTO hours_log (user_id, project_id, hours, date, description) 
           VALUES (?, ?, ?, ?, ?)`,
           [user_id, project_id, hours, date, description],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al registrar horas' });
            }

            // Actualizar horas completadas en el proyecto
            db.run(`UPDATE projects SET hours_completed = hours_completed + ? WHERE id = ?`,
                   [hours, project_id]);

            res.json({ 
                success: true, 
                message: 'Horas registradas exitosamente',
                logId: this.lastID 
            });
        });
});

// Obtener historial de horas del usuario
app.get('/api/user/:id/hours', (req, res) => {
    const userId = req.params.id;

    db.all(`SELECT hl.*, p.name as project_name 
           FROM hours_log hl 
           LEFT JOIN projects p ON hl.project_id = p.id 
           WHERE hl.user_id = ? 
           ORDER BY hl.date DESC`,
           [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener historial de horas' });
        }

        res.json(rows);
    });
});

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/prueba3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'prueba3.html'));
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Base de datos: database.db`);
    console.log(`🔧 Endpoints disponibles:`);
    console.log(`   POST /api/register - Registrar usuario`);
    console.log(`   POST /api/login - Iniciar sesión`);
    console.log(`   GET /api/user/:id - Obtener datos de usuario`);
    console.log(`   GET /api/projects/available - Proyectos disponibles`);
    console.log(`   POST /api/hours - Registrar horas de servicio`);
    console.log(`   GET /api/user/:id/hours - Historial de horas`);
});