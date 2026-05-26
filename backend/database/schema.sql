-- gozbebegim.com Database Schema Initialization
-- MySQL standard schema for AWS RDS MySQL

CREATE DATABASE IF NOT EXISTS `gozbebegim` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gozbebegim`;

-- 1. Users table (Ebeveynler)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone_number` VARCHAR(15) DEFAULT NULL UNIQUE,
  `email` VARCHAR(255) DEFAULT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Children table (Çocuklar)
CREATE TABLE IF NOT EXISTS `children` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `gender` ENUM('Kız', 'Erkek', 'Bilinmiyor') DEFAULT 'Bilinmiyor',
  `age` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Organizations table (Organizasyonlar)
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT NOT NULL,
  `child_id` INT NOT NULL,
  `type` ENUM('Doğum', 'Yaş Günü', 'Sünnet', 'Mezuniyet') NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `parent_slug` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `hospital` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `age_milestone` INT DEFAULT NULL,
  `status` ENUM('Active', 'Archived', 'Private') DEFAULT 'Active',
  `surprise_mode` TINYINT(1) DEFAULT 0,
  `hospital_name` VARCHAR(255) DEFAULT NULL,
  `hospital_room` VARCHAR(50) DEFAULT NULL,
  `visit_hours` VARCHAR(100) DEFAULT NULL,
  `maps_link` VARCHAR(500) DEFAULT NULL,
  `flower_link` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_slugs` (`parent_slug`, `slug`),
  FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Gifts table (Hediyeler)
CREATE TABLE IF NOT EXISTS `gifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `org_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `sub_category` VARCHAR(100) DEFAULT NULL,
  `buyer_name` VARCHAR(255) DEFAULT NULL,
  `buyer_phone` VARCHAR(15) DEFAULT NULL,
  `buyer_user_id` INT DEFAULT NULL,
  `is_bought` TINYINT DEFAULT 0, -- 0: open, 1: reserved, 2: bought
  `is_anonymous` TINYINT(1) DEFAULT 0,
  `is_group` TINYINT(1) DEFAULT 0,
  `group_target` INT DEFAULT 1,
  `group_current` INT DEFAULT 0,
  `gift_photo` LONGTEXT DEFAULT NULL,
  `gift_link` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Gift Comments table (Hediye Altı Yorumlar)
CREATE TABLE IF NOT EXISTS `gift_comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gift_id` INT NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`gift_id`) REFERENCES `gifts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. General Messages table (Genel Pano Tebrik Mesajları)
CREATE TABLE IF NOT EXISTS `general_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `org_id` INT NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `message` TEXT NOT NULL,
  `parent_id` INT DEFAULT NULL,
  `likes` INT DEFAULT 0,
  `is_time_capsule` TINYINT(1) DEFAULT 0,
  `unlock_date` DATE DEFAULT NULL,
  `media_url` VARCHAR(500) DEFAULT NULL,
  `media_type` ENUM('Text', 'Video', 'Image', 'Audio') DEFAULT 'Text',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `general_messages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Family Circles table (Aile Çemberi)
CREATE TABLE IF NOT EXISTS `family_circles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `creator_id` INT NOT NULL,
  `invite_code` VARCHAR(20) UNIQUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Circle Members table (Çember Üyeleri)
CREATE TABLE IF NOT EXISTS `circle_members` (
  `circle_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `role` ENUM('Admin', 'Member') DEFAULT 'Member',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`circle_id`, `user_id`),
  FOREIGN KEY (`circle_id`) REFERENCES `family_circles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Gold and Cash Gifts table (Takı Sandığı)
CREATE TABLE IF NOT EXISTS `gold_and_cash_gifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `org_id` INT NOT NULL,
  `buyer_name` VARCHAR(255) NOT NULL,
  `buyer_phone` VARCHAR(15) NOT NULL,
  `gift_type` ENUM('Ceyrek Altin', 'Gram Altin', 'Nakit Para') NOT NULL,
  `amount` DECIMAL(10,2) DEFAULT NULL,
  `status` ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
  `is_anonymous` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
