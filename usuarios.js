// ==================== RUTAS DE LA API ====================

// Registrar nuevo usuario
app.post('/api/register', async (req, res) => {
    const { name, email, password, career, semester, studentId } = req.body;

    try {
        // Verificar si el usuario ya existe
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error del servidor' });
            }
            
            if (row) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar nuevo usuario
            db.run(`INSERT INTO users (name, email, password, career, semester, student_id) 
                   VALUES (?, ?, ?, ?, ?, ?)`, 
                   [name, email, hashedPassword, career, semester, studentId], 
                   function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear usuario' });
                }

                // Crear perfil del usuario
                const userId = this.lastID;
                db.run(`INSERT INTO user_profiles (user_id, display_name, supervisor) 
                       VALUES (?, ?, ?)`, 
                       [userId, name, 'Supervisor por asignar']);

                res.json({ 
                    success: true, 
                    message: 'Usuario registrado exitosamente',
                    user: { id: userId, name, email, career, semester, studentId }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Login de usuario
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT u.*, up.display_name, up.profile_pic, up.supervisor, up.status 
            FROM users u 
            LEFT JOIN user_profiles up ON u.id = up.user_id 
            WHERE u.email = ?`, [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (!row) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, row.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Obtener proyectos del usuario
        db.all(`SELECT * FROM projects WHERE user_id = ?`, [row.id], (err, projects) => {
            if (err) {
                console.error('Error obteniendo proyectos:', err);
                projects = [];
            }

            // Obtener horas totales aprobadas
            db.get(`SELECT SUM(hours) as total_hours FROM hours_log WHERE user_id = ? AND status = 'approved'`, 
                   [row.id], (err, hoursRow) => {
                if (err) {
                    console.error('Error obteniendo horas:', err);
                    hoursRow = { total_hours: 0 };
                }

                const userData = {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    displayName: row.display_name || row.name,
                    profilePic: row.profile_pic,
                    career: row.career,
                    semester: row.semester,
                    studentId: row.student_id,
                    supervisor: row.supervisor,
                    status: row.status,
                    requiredHours: row.required_hours,
                    completedHours: hoursRow.total_hours || 0,
                    projects: projects || []
                };

                res.json({ 
                    success: true, 
                    user: userData 
                });
            });
        });
    });
});

// Obtener datos del usuario
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;

    db.get(`SELECT u.*, up.display_name, up.profile_pic, up.supervisor, up.status 
            FROM users u 
            LEFT JOIN user_profiles up ON u.id = up.user_id 
            WHERE u.id = ?`, [userId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Obtener proyectos
        db.all(`SELECT * FROM projects WHERE user_id = ?`, [userId], (err, projects) => {
            if (err) {
                console.error('Error obteniendo proyectos:', err);
                projects = [];
            }

            // Obtener horas totales aprobadas
            db.get(`SELECT SUM(hours) as total_hours FROM hours_log WHERE user_id = ? AND status = 'approved'`, 
                   [userId], (err, hoursRow) => {
                if (err) {
                    console.error('Error obteniendo horas:', err);
                    hoursRow = { total_hours: 0 };
                }

                // Obtener historial de horas
                db.all(`SELECT hl.*, p.name as project_name 
                       FROM hours_log hl 
                       LEFT JOIN projects p ON hl.project_id = p.id 
                       WHERE hl.user_id = ? 
                       ORDER BY hl.date DESC 
                       LIMIT 10`, [userId], (err, hoursHistory) => {
                    if (err) {
                        console.error('Error obteniendo historial de horas:', err);
                        hoursHistory = [];
                    }

                    const userData = {
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        displayName: row.display_name || row.name,
                        profilePic: row.profile_pic,
                        career: row.career,
                        semester: row.semester,
                        studentId: row.student_id,
                        supervisor: row.supervisor,
                        status: row.status,
                        requiredHours: row.required_hours,
                        completedHours: hoursRow.total_hours || 0,
                        projects: projects || [],
                        hoursHistory: hoursHistory || []
                    };

                    res.json(userData);
                });
            });
        });
    });
});

// Actualizar perfil de usuario
app.put('/api/user/:id/profile', (req, res) => {
    const userId = req.params.id;
    const { displayName, career, semester, studentId, supervisor } = req.body;

    db.run(`UPDATE users SET career = ?, semester = ?, student_id = ? WHERE id = ?`,
           [career, semester, studentId, userId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }

        db.run(`INSERT OR REPLACE INTO user_profiles (user_id, display_name, supervisor) 
               VALUES (?, ?, ?)`, [userId, displayName, supervisor], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar perfil' });
            }

            res.json({ success: true, message: 'Perfil actualizado exitosamente' });
        });
    });
});