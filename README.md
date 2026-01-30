# Algerian School Management System

A comprehensive web application designed for managing school evaluations and academic data within the Algerian educational context. This system supports multiple roles, multi-language interfaces, and streamlined administrative workflows.

---

### 🌐 Select Language

[**العربية**](README.ar.md) | [**Français**](README.fr.md) | [**English**](README.md) | [**Deutsch**](README.de.md) | [**Türkçe**](README.tr.md) | [**Tamazight**](README.tam.md)

---

## 🚀 Key Features

- **Multi-Role Support**: Tailored dashboards for **Administrators**, **Teachers**, and **Directors**.
- **Multilingual UI**: Full support for Arabic (RTL), French, English, German, Turkish, and Tamazight.
- **Academic Management**:
  - Student and Class registration and tracking.
  - Subject management with specific coefficients.
  - Quarterly evaluation (Trimestriel) and grade entry.
- **Automated setup**: A dedicated PowerShell script for quick local environment setup on Windows.
- **Reporting**: Generation of statistical insights and academic reports.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library**: [Material UI (MUI)](https://mui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with **Express.js**
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)

### Database
- **Engine**: [PostgreSQL](https://www.postgresql.org/)

---

## 🏃 Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher.
- **PostgreSQL**: Version 14 or higher.

### Automated Installation (Recommended for Windows)

1. Open a PowerShell terminal in the root directory.
2. Run the setup script:
   ```powershell
   ./setup.ps1
   ```
3. Follow the on-screen prompts.

---

## 👨‍💻 About the Creator

This project is developed by **Atik Lamine**, a passionate Software Engineer focused on building high-end, premium solutions using cutting-edge AI tools.

- **Email**: atiklamine@gmail.com
- **Availability**: I am currently available for remote work to develop similar stakeholder-driven applications using modern tech stacks and AI-powered workflows.

---

## 📂 Project Structure

- `/backend`: Express server, Prisma schema, and API logic.
- `/frontend2`: Next.js application with MUI and internationalization.
- `/docs`: Project documentation and guides.
- `/infrastructure`: Deployment and infrastructure configurations.

---

## 📄 License
This project is licensed under the ISC License.
