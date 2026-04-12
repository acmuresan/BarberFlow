-- 1. Desactivar revisión de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Vaciar las tablas para poder ejecutar el seed tantas veces como quieras
TRUNCATE TABLE citas;
TRUNCATE TABLE walkins;
TRUNCATE TABLE servicios;
TRUNCATE TABLE barberos;
TRUNCATE TABLE usuarios;

-- 3. Activar de nuevo la revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- INSERTAR USUARIOS (Password para todos: 123456)
-- --------------------------------------------------------
INSERT INTO usuarios (id, nombre, email, password, telefono, rol, created_at) VALUES
(1, 'Carlos Dueño', 'admin@barberflow.com', '$2a$10$zS39L3tG6O02/p91.u2.q.h7H7tN2G1xZ9lG8N.3/1/D2Y.2o5', '600111222', 'admin', NOW()),
(2, 'Javi Barbero', 'javi@barberflow.com', '$2a$10$zS39L3tG6O02/p91.u2.q.h7H7tN2G1xZ9lG8N.3/1/D2Y.2o5', '600333444', 'barbero', NOW()),
(3, 'Cliente Pruebas', 'cliente@barberflow.com', '$2a$10$zS39L3tG6O02/p91.u2.q.h7H7tN2G1xZ9lG8N.3/1/D2Y.2o5', '600555666', 'cliente', NOW());

-- --------------------------------------------------------
-- INSERTAR BARBEROS
-- --------------------------------------------------------
INSERT INTO barberos (id, nombre, especialidad, activo, usuario_id, created_at) VALUES
(1, 'Carlos', 'Barba', 1, 1, NOW()),
(2, 'Javi', 'Fade', 1, 2, NOW()),
(3, 'Miguel', 'Clásico', 1, NULL, NOW()); -- Miguel no tiene cuenta de usuario vinculada

-- --------------------------------------------------------
-- INSERTAR SERVICIOS
-- --------------------------------------------------------
INSERT INTO servicios (id, nombre, precio, duracion, created_at) VALUES
(1, 'Corte', 15.00, 30, NOW()),
(2, 'Barba', 10.00, 20, NOW()),
(3, 'Corte+Barba', 22.00, 45, NOW()),
(4, 'Fade', 18.00, 35, NOW()),
(5, 'Afeitado clásico', 12.00, 25, NOW());

-- --------------------------------------------------------
-- INSERTAR 10 CITAS (Distribuidas dinámicamente)
-- --------------------------------------------------------
INSERT INTO citas (id, usuarios_id, barberos_id, servicios_id, estado, fecha_hora, fecha_hora_fin, created_at) VALUES
-- Citas de AYER (Para probar el historial)
(1, 3, 1, 1, 'completada', DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 10 HOUR + INTERVAL 30 MINUTE, NOW()),
(2, 3, 2, 4, 'cancelada', DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 12 HOUR, DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 12 HOUR + INTERVAL 35 MINUTE, NOW()),

-- Citas de HOY 
(3, 3, 1, 3, 'confirmada', CURDATE() + INTERVAL 15 HOUR, CURDATE() + INTERVAL 15 HOUR + INTERVAL 45 MINUTE, NOW()),
(4, 3, 3, 2, 'completada', CURDATE() + INTERVAL 16 HOUR, CURDATE() + INTERVAL 16 HOUR + INTERVAL 20 MINUTE, NOW()),
(5, 3, 2, 1, 'pendiente', CURDATE() + INTERVAL 18 HOUR, CURDATE() + INTERVAL 18 HOUR + INTERVAL 30 MINUTE, NOW()),

-- Citas de MAÑANA (Para pruebas de solapamiento futuro)
(6, 3, 1, 5, 'confirmada', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 25 MINUTE, NOW()),
(7, 3, 2, 4, 'pendiente', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 11 HOUR + INTERVAL 35 MINUTE, NOW()),
(8, 3, 3, 3, 'pendiente', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 12 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 12 HOUR + INTERVAL 45 MINUTE, NOW()),

-- Citas PASADO MAÑANA
(9, 3, 1, 1, 'pendiente', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 9 HOUR + INTERVAL 30 MINUTE, NOW()),
(10, 3, 2, 2, 'pendiente', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 10 HOUR + INTERVAL 20 MINUTE, NOW());