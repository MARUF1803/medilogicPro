# MediLogicPro - Enterprise Grade Hybrid ERP System

MediLogicPro is a robust, full-stack enterprise resource planning (ERP) system designed to streamline business operations, focusing on Sales, Inventory Management, and high-performance Point of Sale (POS) functionality. This project features a unique **Hybrid Architecture**, leveraging both Angular and React to provide specialized interfaces for different business roles.

## 🚀 Key Features

### 🛒 Advanced Point of Sale (POS)
- Built with **Angular 19** for high-performance data binding and real-time updates.
- Supports **Partial Payments**, Pending Sales, and Walk-in vs. Registered customer workflows.
- Real-time inventory deduction and stock validation during checkout.
- Automated invoice generation and printable transaction receipts.

### 🛡️ Admin Control Panel
- Built with **React** for a modular and dynamic dashboard experience.
- Comprehensive user role management and granular access control.
- Centralized management for Products, Batches, and Categories.

### 📦 Inventory & Procurement
- Real-time stock tracking with batch-wise expiry monitoring.
- Automated GRN (Goods Received Note) processing.
- Sales and Purchase return management with automated inventory adjustment.

### 📊 Business Intelligence
- Integrated analytics with dashboard visualizations.
- Detailed reporting for Profit/Loss, Sales Summaries, and Inventory Valuation.

---

## 🛠️ Tech Stack

- **Backend:** ASP.NET Core 8/9 Web API, Entity Framework Core (EF Core)
- **Database:** Microsoft SQL Server
- **Authentication:** JWT (JSON Web Token) with Role-Based Access Control (RBAC)
- **Frontend (POS):** Angular 19, RxJS, PrimeNG/TailwindCSS
- **Frontend (Admin):** React.js, TailwindCSS
- **Logging:** Serilog / Custom Audit Logging

---

## 🏗️ Architecture

The system follows a modular, clean architecture pattern:
- **MediLogicPro.Auth:** Handles identity and security.
- **MediLogicPro.Data:** EF Core DBContext and Data models.
- **MediLogicPro.Logic:** Business logic and service layers.
- **MediLogicPro.Models:** Shared DTOs and entity models.
- **Hybrid Frontend:** 
  - `/medilogicpro-pos`: Angular-based high-speed transaction hub.
  - `/medilogicpro-frontend`: React-based administrative control hub.

---

## 🔧 Installation & Setup

1. **Prerequisites:**
   - .NET 8 SDK or higher
   - Node.js (v18+)
   - SQL Server

2. **Backend Setup:**
   ```bash
   cd MediLogicPro/MediLogicPro
   dotnet restore
   dotnet ef database update
   dotnet run
   ```

3. **Frontend (React Admin) Setup:**
   ```bash
   cd medilogicpro-frontend
   npm install
   npm run dev
   ```

4. **Frontend (Angular POS) Setup:**
   ```bash
   cd medilogicpro-pos
   npm install
   ng serve
   ```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
