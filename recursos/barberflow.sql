-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 18, 2026 at 09:08 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `barberflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `barberos`
--

CREATE TABLE `barberos` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barberos`
--

INSERT INTO `barberos` (`id`, `nombre`, `especialidad`, `activo`, `created_at`, `usuario_id`) VALUES
(1, 'Carlos', 'Corte clásico', 1, '2026-04-12 08:29:53', 1),
(2, 'Javi', 'Barba y perfilado', 0, '2026-04-12 08:29:53', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `citas`
--

CREATE TABLE `citas` (
  `id` int NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','completada','cancelada') DEFAULT 'pendiente',
  `usuarios_id` int NOT NULL,
  `barberos_id` int NOT NULL,
  `servicios_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `citas`
--

INSERT INTO `citas` (`id`, `fecha_hora`, `fecha_hora_fin`, `estado`, `usuarios_id`, `barberos_id`, `servicios_id`, `created_at`) VALUES
(1, '2026-04-20 10:00:00', '2026-04-20 10:30:00', 'pendiente', 1, 1, 1, '2026-04-12 08:30:11'),
(2, '2026-04-20 11:00:00', '2026-04-20 11:30:00', 'pendiente', 1, 1, 1, '2026-04-15 20:11:26'),
(3, '2026-04-20 10:30:00', '2026-04-20 11:00:00', 'pendiente', 1, 1, 1, '2026-04-15 20:15:02'),
(4, '2026-04-20 11:00:00', '2026-04-20 11:30:00', 'pendiente', 1, 2, 1, '2026-04-15 20:16:24'),
(5, '2026-04-20 11:30:00', '2026-04-20 12:00:00', 'pendiente', 1, 2, 1, '2026-04-15 20:16:39'),
(6, '2026-04-15 20:40:00', '2026-04-15 21:10:00', 'pendiente', 1, 1, 1, '2026-04-15 20:36:39'),
(7, '2026-04-15 21:00:00', '2026-04-15 21:30:00', 'pendiente', 1, 1, 1, '2026-04-15 20:48:07');

-- --------------------------------------------------------

--
-- Table structure for table `servicios`
--

CREATE TABLE `servicios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `precio`, `duracion`, `created_at`) VALUES
(1, 'Corte de pelo', 15.00, 30, '2026-04-12 08:29:53'),
(2, 'Corte y barba', 25.00, 45, '2026-04-12 08:29:53'),
(3, 'Afeitado', 10.00, 20, '2026-04-12 08:29:53');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('admin','barbero','cliente') DEFAULT 'cliente',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `telefono`, `rol`, `created_at`) VALUES
(1, 'Alex', 'alex@gmail.com', '$2b$10$efFAO2oqFJuItHjw15wWNeYJLURojtq5IW124K6RhXER1F0dz3SlK', NULL, 'barbero', '2026-03-21 20:37:17'),
(2, 'Test Cliente', 'cliente@test.com', '$2b$10$DEI/CNzDB.Z/KnU3yBYQNuN4HSmFJ9VttHKGjm.vEXPEfXjqD0noq', NULL, 'cliente', '2026-04-15 19:44:36'),
(3, 'Admin', 'admin@gmail.com', '$2b$10$efFAO2oqFJuItHjw15wWNeYJLURojtq5IW124K6RhXE...', NULL, 'admin', '2026-04-15 19:58:20'),
(4, 'Admin', 'admin@barberflow.com', '$2b$10$wk7TJMKuOLQugQKIjvQY1ueU3Dfbiln/jv3tcw/25q4mVWqaVgw5e', NULL, 'admin', '2026-04-15 19:59:35'),
(5, 'Marta', 'm@gmail.com', '$2b$10$k4S2TvG0Twz7xpS6B.ag4.zEv7VETSqmA5WQp0w/dV/U6SEYr08I.', NULL, 'cliente', '2026-04-18 10:36:34'),
(6, 'cliente', 'cliente@gmail.com', '$2b$10$8LKcRu7XHPyNl4iO2.u1qOUAOBCnjMWgNa4fqO7jmvdtPHDtpvwKe', NULL, 'cliente', '2026-04-18 10:50:53');

-- --------------------------------------------------------

--
-- Table structure for table `walkins`
--

CREATE TABLE `walkins` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `barberos_id` int DEFAULT NULL,
  `hora_llegada` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('esperando','atendiendo','completado','cancelado') DEFAULT 'esperando',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `walkins`
--

INSERT INTO `walkins` (`id`, `nombre`, `barberos_id`, `hora_llegada`, `estado`, `created_at`) VALUES
(1, 'Cliente Test', 1, '2026-04-15 20:33:27', 'atendiendo', '2026-04-15 20:33:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barberos`
--
ALTER TABLE `barberos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_barberos_usuario_id` (`usuario_id`);

--
-- Indexes for table `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_citas_usuarios_idx` (`usuarios_id`),
  ADD KEY `fk_citas_barberos1_idx` (`barberos_id`),
  ADD KEY `fk_citas_servicios1_idx` (`servicios_id`);

--
-- Indexes for table `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`);

--
-- Indexes for table `walkins`
--
ALTER TABLE `walkins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_walkins_barberos_idx` (`barberos_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barberos`
--
ALTER TABLE `barberos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `walkins`
--
ALTER TABLE `walkins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barberos`
--
ALTER TABLE `barberos`
  ADD CONSTRAINT `fk_barberos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `fk_citas_barberos1` FOREIGN KEY (`barberos_id`) REFERENCES `barberos` (`id`),
  ADD CONSTRAINT `fk_citas_servicios1` FOREIGN KEY (`servicios_id`) REFERENCES `servicios` (`id`),
  ADD CONSTRAINT `fk_citas_usuarios` FOREIGN KEY (`usuarios_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `walkins`
--
ALTER TABLE `walkins`
  ADD CONSTRAINT `fk_walkins_barberos` FOREIGN KEY (`barberos_id`) REFERENCES `barberos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
