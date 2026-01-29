# Algerian School System - Installation Guide

This document provides instructions on how to install and run the School Management System on your local machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Automated Installation (Windows)](#automated-installation-windows)
3. [Manual Installation](#manual-installation)
4. [Running the Application](#running-the-application)

---

## Prerequisites

To run this application, you need the following tools installed:

- **Node.js**: Version 18.x or higher.
- **PostgreSQL**: Version 14 or higher.
- **npm**: (Comes with Node.js).

---

## Automated Installation (Windows)

We provide a PowerShell script that automates the setup process, including environment variable creation and dependency installation.

1. Open a PowerShell terminal in the root directory.
2. Run the following command:
   ```powershell
   ./setup.ps1
   ```
3. Follow the prompts in the terminal.

> [!NOTE]
> The script will attempt to create a `tools` folder and can potentially download portable versions of Node.js and PostgreSQL if you don't have them.

---

## Manual Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd algerian-school-system
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Update `DATABASE_URL` with your PostgreSQL credentials.
4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend2
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.

---

## Running the Application

### Start the Backend
```bash
cd backend
npm run dev
```
The backend will be available at `http://localhost:3000`.

### Start the Frontend
```bash
cd frontend2
npm run dev
```
The frontend will be available at `http://localhost:3002`.

---

## Support
If you encounter any issues during installation, please check the console logs for detailed error messages.
