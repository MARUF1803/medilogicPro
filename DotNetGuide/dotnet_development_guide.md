# Complete Guide to .NET Development

## 1. Introduction to .NET
.NET is a free, cross-platform, open-source developer platform created by Microsoft for building many different types of applications. It supports multiple languages, with C# being the most popular, followed by F# and Visual Basic.

### The Evolution of .NET
*   **.NET Framework**: The original, Windows-only version of .NET.
*   **.NET Core**: A cross-platform, open-source rewrite of .NET for Windows, Linux, and macOS.
*   **.NET (5/6/7/8/9+)**: The unified successor to both .NET Framework and .NET Core, representing a single platform for all workloads.

## 2. Setting Up the Development Environment
To start developing with .NET, you need the SDK and a code editor.

1.  **Install the .NET SDK**: Download the latest Long-Term Support (LTS) or Standard Term Support version from the official Microsoft .NET website.
2.  **Choose an IDE / Editor**:
    *   **Visual Studio (Windows/Mac)**: The heavy-duty, fully-featured IDE. Excellent for enterprise development.
    *   **Visual Studio Code (Cross-Platform)**: A lightweight, extensible code editor. Highly recommended with the C# Dev Kit extension.
    *   **JetBrains Rider (Cross-Platform)**: A powerful, cross-platform .NET IDE favored by many professional developers.

## 3. The .NET CLI (Command-Line Interface)
The .NET CLI is a cross-platform toolchain for developing, building, running, and publishing .NET applications.

**Common Commands:**
*   `dotnet new <template>` : Creates a new project (e.g., `dotnet new webapi`, `dotnet new console`).
*   `dotnet restore` : Restores dependencies defined in the `.csproj` file.
*   `dotnet build` : Builds the project and its dependencies into a set of binaries.
*   `dotnet run` : Builds and runs the application.
*   `dotnet test` : Runs unit tests using the configured test runner.

## 4. Key Concepts in ASP.NET Core
ASP.NET Core is the web development framework for .NET.

### Dependency Injection (DI)
.NET has built-in DI. Services are registered in `Program.cs` and injected into classes (like Controllers) via their constructors.
*   **Transient**: A new instance is created every time it is requested.
*   **Scoped**: A new instance is created once per HTTP request.
*   **Singleton**: A single instance is created and shared across the entire application's lifetime.

### Middleware Pipeline
The ASP.NET Core request pipeline consists of middleware components. Each component chooses whether to pass the request to the next component and can perform work before or after the next component. Common middleware includes Routing, Authentication, Authorization, and CORS.

### Minimal APIs vs. Controllers
*   **Controllers**: The traditional approach, using classes derived from `ControllerBase` with action methods handling specific routes. Good for large, complex APIs.
*   **Minimal APIs**: Introduced in .NET 6, allowing you to define endpoints directly in `Program.cs` cleanly and concisely without controller boilerplate. Better for microservices.

## 5. Data Access with Entity Framework Core (EF Core)
EF Core is the official Object-Relational Mapper (ORM) for .NET.

*   **DbContext**: The primary class responsible for interacting with the database.
*   **DbSet**: Represents a table in the database and allows querying and saving instances of an entity.
*   **Migrations**: A way to keep your database schema in sync with your C# entity models (`dotnet ef migrations add InitialCreate`, `dotnet ef database update`).

## 6. Testing
.NET has robust support for testing.
*   **xUnit / NUnit / MSTest**: Popular testing frameworks. xUnit is arguably the most widely used today.
*   **Moq / NSubstitute**: Libraries for creating mock objects to isolate the code being tested.
*   **Test-Driven Development (TDD)**: The practice of writing tests before the actual implementation code.

## 7. Architecture & Best Practices
*   **Clean Architecture**: Organizing code into layers (Domain, Application, Infrastructure, Presentation) so that the core business logic is independent of frameworks, databases, and UI.
*   **Asynchronous Programming**: Always use `async` / `await` for I/O bound operations (like database calls and network requests) to keep the application responsive and scalable.
*   **Configuration**: Store settings in `appsettings.json`, environment variables, or secure stores like Azure Key Vault. Avoid hardcoding secrets.

## 8. Deployment
.NET applications can be deployed in multiple ways depending on the target environment:
*   **Self-Contained Deployment (SCD)**: Includes the .NET runtime with your app. Does not require the host machine to have .NET installed.
*   **Framework-Dependent Deployment (FDD)**: Relies on a shared runtime installed on the target machine. Creates smaller deployment packages.
*   **Docker**: .NET has excellent Container support. You can easily package a .NET app into a Docker Image and run it on Kubernetes or container services like AWS ECS or Azure Container Apps.
