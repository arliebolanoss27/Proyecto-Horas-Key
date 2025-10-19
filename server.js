const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inicializar base de datos
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite');
        initializeDatabase();
    }
});

// Crear tablas si no existen
function initializeDatabase() {
    // Crear tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        career TEXT,
        semester TEXT,
        student_id TEXT,
        required_hours INTEGER DEFAULT 80,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creando tabla users:', err);
        } else {
            console.log('Tabla users creada/verificada');
        }
    });

    // Crear tabla de perfiles
    db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY,
        display_name TEXT,
        profile_pic TEXT,
        supervisor TEXT,
        status TEXT DEFAULT 'Activo',
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('Error creando tabla user_profiles:', err);
        } else {
            console.log('Tabla user_profiles creada/verificada');
        }
    });

    // Crear tabla de proyectos
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        hours_completed INTEGER DEFAULT 0,
        total_hours INTEGER,
        start_date TEXT,
        supervisor TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('Error creando tabla projects:', err);
        } else {
            console.log('Tabla projects creada/verificada');
            insertDemoData();
        }
    });

    // Crear tabla de horas registradas
    db.run(`CREATE TABLE IF NOT EXISTS hours_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        project_id INTEGER,
        hours INTEGER NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (project_id) REFERENCES projects (id)
    )`, (err) => {
        if (err) {
            console.error('Error creando tabla hours_log:', err);
        } else {
            console.log('Tabla hours_log creada/verificada');
        }
    });
}

// Insertar datos de demostración
function insertDemoData() {
    // Verificar si ya existe el usuario demo
    db.get("SELECT * FROM users WHERE email = 'estudiante@keyinstitute.edu.sv'", (err, row) => {
        if (err) {
            console.error('Error verificando usuario demo:', err);
            return;
        }

        if (!row) {
            console.log('Insertando usuario demo...');
            const demoPassword = bcrypt.hashSync('password', 10);
            
            // Insertar usuario demo
            db.run(`INSERT INTO users (name, email, password, career, semester, student_id) 
                   VALUES (?, ?, ?, ?, ?, ?)`, 
                   ['Mike B', 'estudiante@keyinstitute.edu.sv', demoPassword, 
                    'Ingeniería Mecatronica y Robotica', 'Ciclo 01', 'KEY_000000'],
                function(err) {
                    if (err) {
                        console.error('Error insertando usuario demo:', err);
                        return;
                    }
                    
                    const userId = this.lastID;
                    console.log('Usuario demo creado con ID:', userId);
                    
                    // Insertar perfil
                    db.run(`INSERT INTO user_profiles (user_id, display_name, profile_pic, supervisor) 
                           VALUES (?, ?, ?, ?)`, 
                           [userId, 'Mike B', 
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80', 
                            'Miguel Batres'],
                        function(err) {
                            if (err) {
                                console.error('Error insertando perfil demo:', err);
                                return;
                            }
                            console.log('Perfil demo creado');
                            
                            // Insertar proyectos de ejemplo
                            insertDemoProjects(userId);
                        });
                });
        } else {
            console.log('Usuario demo ya existe');
        }
    });
}

function insertDemoProjects(userId) {
    const projects = [
        {
            name: 'Laboratorista',
            description: 'Apoyo en laboratorios de ingeniería',
            hours_completed: 25,
            total_hours: 40,
            start_date: '2023-08-15',
            supervisor: 'Miguel Batres',
            status: 'active'
        },
        {
            name: 'Organización de Rok Talks',
            description: 'Coordinación de eventos académicos',
            hours_completed: 15,
            total_hours: 30,
            start_date: '2023-09-10',
            supervisor: 'Miguel Batres',
            status: 'active'
        },
        {
            name: 'Teacher Assistant',
            description: 'Apoyo en clases de programación',
            hours_completed: 5,
            total_hours: 20,
            start_date: '2023-10-05',
            supervisor: 'Miguel Batres',
            status: 'pending'
        }
    ];

    projects.forEach((project, index) => {
        db.run(`INSERT INTO projects (user_id, name, description, hours_completed, total_hours, start_date, supervisor, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
               [userId, project.name, project.description, project.hours_completed, 
                project.total_hours, project.start_date, project.supervisor, project.status],
            function(err) {
                if (err) {
                    console.error('Error insertando proyecto demo:', err);
                } else {
                    console.log(`Proyecto demo ${index + 1} creado: ${project.name}`);
                    
                    // Insertar horas de ejemplo para el proyecto
                    if (project.hours_completed > 0) {
                        insertDemoHours(userId, this.lastID, project.hours_completed);
                    }
                }
            });
    });
}

function insertDemoHours(userId, projectId, totalHours) {
    const hoursEntries = [
        { hours: 4, date: '2023-10-15', description: 'Configuración de equipos de laboratorio' },
        { hours: 6, date: '2023-10-12', description: 'Preparación de materiales para prácticas' },
        { hours: 5, date: '2023-10-08', description: 'Mantenimiento de equipos electrónicos' },
        { hours: 3, date: '2023-10-05', description: 'Organización de inventario' },
        { hours: 7, date: '2023-10-01', description: 'Apoyo en sesiones prácticas' }
    ];

    let hoursInserted = 0;
    hoursEntries.forEach(entry => {
        if (hoursInserted < totalHours) {
            const hoursToAdd = Math.min(entry.hours, totalHours - hoursInserted);
            db.run(`INSERT INTO hours_log (user_id, project_id, hours, date, description, status) 
                   VALUES (?, ?, ?, ?, ?, ?)`,
                   [userId, projectId, hoursToAdd, entry.date, entry.description, 'approved']);
            hoursInserted += hoursToAdd;
        }
    });
}
