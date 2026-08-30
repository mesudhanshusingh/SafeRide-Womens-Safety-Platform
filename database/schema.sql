-- SafeRide AI - Database Schema (MySQL Relational Tables)
-- Normalized to 3NF

CREATE DATABASE IF NOT EXISTS saferide_db;
USE saferide_db;

-- 1. Users Table (Stores user credential and profile details)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    emergency_passcode VARCHAR(100) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'ROLE_USER', -- ROLE_USER, ROLE_ADMIN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for authentication search optimization
CREATE INDEX idx_user_email ON users(email);

-- 2. Trusted Contacts Table (Many-to-One with Users)
CREATE TABLE IF NOT EXISTS trusted_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trusted_user_id ON trusted_contacts(user_id);

-- 3. Verified Drivers Registry Table (Pre-verified transport database to cross check fake details)
CREATE TABLE IF NOT EXISTS drivers_registry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL, -- e.g., MH12AB1234, KA03MX8899
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    rating DOUBLE DEFAULT 5.0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_driver_vehicle ON drivers_registry(vehicle_number);

-- 4. Complaints Portal Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100),
    incident_date TIMESTAMP NOT NULL,
    incident_type VARCHAR(50) NOT NULL, -- Harassment, Speeding, Suspicious Route, Reckless Behavior, Other
    description TEXT NOT NULL,
    evidence_url VARCHAR(255), -- File upload reference
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, INVESTIGATING, RESOLVED, DISMISSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_complaint_user_id ON complaints(user_id);
CREATE INDEX idx_complaint_vehicle ON complaints(vehicle_number);
