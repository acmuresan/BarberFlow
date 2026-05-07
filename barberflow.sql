-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 07, 2026 at 04:24 PM
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
(1, 'Pepe 2', 'Corte de pelo ', 1, '2026-04-27 16:39:45', 5),
(2, 'Juan', 'Afeitado', 0, '2026-04-27 17:09:21', 8),
(3, 'Ana ', 'Tinte', 1, '2026-04-27 17:19:37', 9),
(4, 'Barbero Prueba 2', 'Corte infantil ', 1, '2026-05-04 15:33:25', 11),
(5, 'BarberoPrueba', 'Tintes', 1, '2026-05-06 16:37:38', 14);

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
(1, '2026-04-27 17:00:00', '2026-04-27 17:30:00', 'completada', 6, 1, 1, '2026-04-27 16:48:09'),
(2, '2026-04-28 12:00:00', '2026-04-28 12:30:00', 'confirmada', 7, 1, 1, '2026-04-27 17:00:27'),
(3, '2026-04-29 12:00:00', '2026-04-29 12:30:00', 'confirmada', 7, 1, 1, '2026-04-27 17:02:16'),
(4, '2026-04-30 11:00:00', '2026-04-30 11:30:00', 'confirmada', 7, 1, 1, '2026-04-27 17:08:53'),
(5, '2026-04-30 17:00:00', '2026-04-30 17:30:00', 'completada', 7, 1, 1, '2026-04-27 17:12:59'),
(6, '2026-04-30 12:00:00', '2026-04-30 12:30:00', 'confirmada', 7, 1, 1, '2026-04-27 17:14:14'),
(7, '2026-04-30 12:00:00', '2026-04-30 13:05:00', 'cancelada', 10, 2, 1, '2026-04-29 20:01:32'),
(8, '2026-04-30 12:00:00', '2026-04-30 13:05:00', 'confirmada', 10, 2, 1, '2026-04-29 21:07:48'),
(9, '2026-05-27 12:00:00', '2026-05-27 13:05:00', 'confirmada', 10, 3, 1, '2026-05-03 17:56:37'),
(10, '2026-05-29 12:00:00', '2026-05-29 13:05:00', 'confirmada', 7, 3, 1, '2026-05-03 17:57:54'),
(11, '2026-05-08 17:00:00', '2026-05-08 17:30:00', 'cancelada', 12, 4, 3, '2026-05-04 15:41:56'),
(12, '2026-05-08 16:00:00', '2026-05-08 16:30:00', 'pendiente', 12, 4, 3, '2026-05-04 15:50:52'),
(13, '2026-05-04 17:00:00', '2026-05-04 18:05:00', 'confirmada', 13, 4, 1, '2026-05-04 16:07:27'),
(14, '2026-05-05 16:00:00', '2026-05-05 16:30:00', 'cancelada', 13, 4, 3, '2026-05-04 16:07:45'),
(15, '2026-05-22 19:00:00', '2026-05-22 21:00:00', 'pendiente', 12, 4, 4, '2026-05-06 16:35:14');

-- --------------------------------------------------------

--
-- Table structure for table `servicios`
--

CREATE TABLE `servicios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `precio`, `duracion`, `created_at`, `activo`) VALUES
(1, 'Corte de pelo ', 20.00, 65, '2026-04-27 16:43:46', 1),
(2, 'Afeitado cabeza', 15.00, 20, '2026-04-29 21:11:46', 1),
(3, 'Corte Infantil ', 7.00, 30, '2026-05-04 15:34:00', 1),
(4, 'Tinte', 45.00, 120, '2026-05-04 16:12:31', 1);

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
(4, 'Admin', 'admin@barberflow.com', '$2b$10$wk7TJMKuOLQugQKIjvQY1ueU3Dfbiln/jv3tcw/25q4mVWqaVgw5e', NULL, 'admin', '2026-04-15 19:59:35'),
(5, 'Pepe 2', 'pepe2@barberflow.com', '$2b$10$T7OhSgIgZ46vOU9du50y3uh1cjWWOUYc0cqJ2/Rbfqd7XhqHzwTs2', NULL, 'barbero', '2026-04-27 16:39:45'),
(6, 'cliente 1', 'cliente1@barberflow.com', '$2b$10$IspdGAWrQaJ/s4Wk8cObFO/nZZFcMPDy2HpbhM0O2fotiKblX3AIu', NULL, 'cliente', '2026-04-27 16:47:08'),
(7, 'Alex', 'alexmuresan1995@gmail.com', '$2b$10$5.iQ2cbWjDGS1IZh9e5LiOYCFVXvYMiGbh3TrOtndnk5iRv5mWKaK', NULL, 'cliente', '2026-04-27 17:00:15'),
(8, 'Juan', 'juan@barberflow.com', '$2b$10$xlP9lOclC6cS2V3dKK7QKOn1Wo439g.qb6kqRj4ZvFLN22EGGNtP.', NULL, 'barbero', '2026-04-27 17:09:21'),
(9, 'Ana ', 'ana@barberflow.com', '$2b$10$2W55FucA4BmFrvlmnsGaS.THxTXng9sUD9xDqD1YoCWPUNet2WkIi', NULL, 'barbero', '2026-04-27 17:19:37'),
(10, 'Pepe', 'pepe@barberflow.com', '$2b$10$CYVW83d0W.B4zczUC/9dXu2LaHelDqK9FpoYJwdzGNGVNAaOwF3Qm', NULL, 'cliente', '2026-04-29 19:51:20'),
(11, 'Barbero Prueba 2', 'barberoPrueba@gmail.com', '$2a$10$SOv9MXMoEJZY2MLy2uk7/.HY8Nl.mSXEC6adInye85y1x1ZUv10pa', NULL, 'barbero', '2026-05-04 15:33:25'),
(12, 'Cliente Ngrok', 'clienteNgrok@gmail.com', '$2a$10$rx7LA9XWI5dF0X6qtHDlJO7Q9.0k3KIAMhEiz6QCa.tT75ZeQBzlC', NULL, 'cliente', '2026-05-04 15:41:27'),
(13, 'Prueba', 'p@gmail.com', '$2a$10$0X7Qs2kT1f95DNKLFwLH8uoFl9nDJVMhdyHU/za.EAyf7LDFCxQOe', NULL, 'cliente', '2026-05-04 16:06:32'),
(14, 'BarberoPrueba', 'barberoPrueba@barberflow.com', '$2a$10$rF5I93xRWtRgv3vBV6GQxu09cnhIkSlRdhant/UyGDbkdn0hocgHa', NULL, 'barbero', '2026-05-06 16:37:38');

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
(1, 'A', 4, '2026-05-04 15:35:34', 'completado', '2026-05-04 15:35:34'),
(2, 'B', 4, '2026-05-04 15:35:36', 'esperando', '2026-05-04 15:35:36'),
(3, 'C', 4, '2026-05-04 15:35:38', 'cancelado', '2026-05-04 15:35:38'),
(4, 'Asd', 4, '2026-05-04 16:09:49', 'completado', '2026-05-04 16:09:49'),
(5, 'A', 5, '2026-05-06 16:37:55', 'esperando', '2026-05-06 16:37:55'),
(6, 'C', 5, '2026-05-06 16:37:57', 'esperando', '2026-05-06 16:37:57'),
(7, 'D', 5, '2026-05-06 16:37:58', 'esperando', '2026-05-06 16:37:58'),
(8, 'F', 5, '2026-05-06 16:38:02', 'esperando', '2026-05-06 16:38:02');

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `walkins`
--
ALTER TABLE `walkins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
