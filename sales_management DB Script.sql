-- Create Database
CREATE DATABASE sales_management ;
USE sales_management;

CREATE TABLE `customers` (
  `Customer_ID` char(36) NOT NULL,
  `Salesman_ID` char(36) DEFAULT NULL,
  `Customer_name` varchar(255) NOT NULL,
  `Customer_city` varchar(100) NOT NULL,
  `Customer_region` enum('North-East','Mid-West','Pacific') NOT NULL DEFAULT 'North-East',
  `Customer_tier` enum('A','B','C') NOT NULL DEFAULT 'A',
  `customer_salesmen` json DEFAULT NULL,
  `Customer_contact` varchar(255) DEFAULT NULL,
  `Customer_email` varchar(255) DEFAULT NULL,
  `Customer_phone` varchar(50) DEFAULT NULL,
  `Customer_address` varchar(255) DEFAULT NULL,
  `Customer_notes` text,
  `Customer_status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Customer_ID`),
  UNIQUE KEY `Customer_email` (`Customer_email`),
  KEY `Salesman_ID` (`Salesman_ID`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`Salesman_ID`) REFERENCES `salesmen` (`Salesman_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `distributors` (
  `Distributor_ID` char(36) NOT NULL,
  `Salesman_ID` char(36) DEFAULT NULL,
  `Distributor_name` varchar(100) NOT NULL,
  `Distributor_company` varchar(100) DEFAULT NULL,
  `Distributor_region` enum('North-East','Mid-West','Pacific') DEFAULT 'North-East',
  `Distributor_phone` varchar(20) DEFAULT NULL,
  `Distributor_email` varchar(100) DEFAULT NULL,
  `Distributor_contact` varchar(100) DEFAULT NULL,
  `Distributor_status` enum('Active','Inactive') DEFAULT 'Active',
  `Distributor_assignedProducts` int DEFAULT '0',
  `Distributor_created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`Distributor_ID`),
  UNIQUE KEY `Distributor_email` (`Distributor_email`),
  KEY `Salesman_ID` (`Salesman_ID`),
  CONSTRAINT `distributors_ibfk_1` FOREIGN KEY (`Salesman_ID`) REFERENCES `salesmen` (`Salesman_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `products` (
  `Product_ID` char(36) NOT NULL,
  `Distributor_ID` char(36) DEFAULT NULL,
  `Product_name` varchar(100) NOT NULL,
  `Product_sku` varchar(50) NOT NULL,
  `Product_category` enum('Widgets','Cables','Adapters') DEFAULT 'Widgets',
  `Product_price` decimal(10,2) NOT NULL,
  `Product_stock` int DEFAULT '0',
  `Product_status` enum('Active','Inactive') DEFAULT 'Active',
  `Product_description` text,
  `Product_created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Product_ID`),
  UNIQUE KEY `Product_sku` (`Product_sku`),
  KEY `Distributor_ID` (`Distributor_ID`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`Distributor_ID`) REFERENCES `distributors` (`Distributor_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `salesmen` (
  `Salesman_ID` char(36) NOT NULL,
  `Salesman_name` varchar(100) NOT NULL,
  `Salesman_region` enum('North-East','Mid-West','Pacific') NOT NULL,
  `Salesman_email` varchar(150) NOT NULL,
  `Salesman_phone` varchar(15) NOT NULL,
  `Salesman_distros` int DEFAULT '0',
  `Salesman_custs` int DEFAULT '0',
  `Salesman_status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Salesman_ID`),
  UNIQUE KEY `Salesman_email` (`Salesman_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `settings` (
  `setting_id` char(36) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci