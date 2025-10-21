const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos\n');
});

// Ver usuarios
console.log('👥 USUARIOS:');
db.all(`SELECT id, name, email, career, student_id FROM users`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.table(rows);
    
    // Ver proyectos
    console.log('\n📁 PROYECTOS:');
    db.all(`SELECT id, user_id, name, hours_completed, status FROM projects`, (err, projects) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.table(projects);
        
        // Ver horas
        console.log('\n⏰ HORAS REGISTRADAS:');
        db.all(`SELECT id, user_id, project_id, hours, date, status FROM hours_log`, (err, hours) => {
            if (err) {
                console.error('Error:', err);
                return;
            }
            console.table(hours);
            
            db.close();
        });
    });
});