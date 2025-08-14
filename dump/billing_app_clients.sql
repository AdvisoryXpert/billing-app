-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: billing_app
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GSTIN` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'Acme Corporation India','acme@example.com','9989902212',NULL,'Bangalore','2025-07-22 02:24:25','2025-08-09 09:34:53','Karnataka','21221123344'),(2,'In Acme Corporation','acme@examplel.com','9876543210',NULL,'Bangalore, India','2025-07-22 02:40:31','2025-08-09 09:34:10','Karnataka','21221123344'),(3,'Client Aabd','clienta@example.com','1234567790',NULL,'123 Main Street','2025-07-22 03:45:49','2025-07-22 03:45:49','Karnataka','21221123344'),(4,'Entbysys Acme Corp','acme_1@example.com','9876543290',NULL,'Bangalore, India','2025-08-06 07:10:55','2025-08-06 07:10:55','Karnataka','21221123344'),(5,'Entbysys Limited','acme_123@example.com','9876501121',NULL,'Bangalore, India','2025-08-06 07:37:13','2025-08-09 09:33:13','Karnataka','21221123344'),(6,'abcd3','abcd1@gmailc.om','9088900012',NULL,'Bangalore, India','2025-08-06 07:37:13','2025-08-09 09:17:41','Karnataka','21221123344'),(7,'abcd2','abcd2@hotmail.com','9989001221',NULL,'T Extn.','2025-08-06 07:37:13','2025-08-06 07:37:13','Karnataka','2122112334421221123344'),(8,'abcd3','abcd3@gmail.com','9890012113',NULL,'T Exten.','2025-08-06 07:37:13','2025-08-06 07:37:13','Karnataka','21221123344'),(9,'abcd4','abcd4@gmailc.om','9811213459',NULL,'T Extn.','2025-08-06 07:37:13','2025-08-06 07:37:13','Karnataka','21221123344'),(10,'abcd7','abcd7@gmailc.om','9889000212',NULL,'T Exten.','2025-08-06 07:37:13','2025-08-06 07:37:13','Karnataka','21221123344'),(11,'abcd10','abcd10@gmailc.om','9989112122',NULL,'T extn','2025-08-06 07:37:13','2025-08-09 11:38:43','Karnataka','21221123344'),(12,'abcd112','abcd112@hotmailc.ocm','9989001211',NULL,'T Ext.','2025-08-06 07:37:13','2025-08-06 07:37:13','Karnataka','21221123344'),(13,'abcd121','abcd121@gmailc.om','9976677244',NULL,'T Extn.','2025-08-06 07:37:13','2025-08-06 07:37:13','Karnataka','21221123344');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-14 12:40:44
