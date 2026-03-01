# Distributed System for the Content Management (CMS)

A cloud-native distributed content management system built with .NET 10, Azure Container Apps, and React. This project demonstrates modern microservices architecture with load balancing, containerization, and CI/CD automation.

## Architecture Overview

### Components

- **Gateway (YARP)**: Reverse proxy using YARP that routes requests and serves the React UI
- **CMS Service**: Core microservice (`src/CMS.Service/`) with API endpoints for content management
- **UI Client**: React + TypeScript frontend (`src/ui-client/`) with Redux state management
- **Load Balancing**: Round-robin distribution across multiple CMS service nodes

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | .NET 10 LTS, Node.js 24 |
| **Container Orchestration** | Azure Container Apps, Docker, Docker Compose |
| **Frontend** | React 19, TypeScript, Material-UI, SCSS |
| **Backend** | ASP.NET Core 10, YARP 2.3, Entity Framework Core 10 |
| **State Management** | Redux Toolkit, RTK Query |
| **Database** | PostgreSQL 10 |
| **Storage** | MinIO (S3-compatible) |
| **CI/CD** | GitHub Actions, Azure Container Registry |
| **Build Tools** | Vite, ESLint, TypeScript Compiler |

## Quick Start

### Local Development with Docker Compose

```bash
docker-compose up --build
```
This starts:
 - Gateway: http://localhost:80
 - CMS Node 1: Internal (NODE_ID: CMS_SERVER_NODE_01)
 - CMS Node 2: Internal (NODE_ID: CMS_SERVER_NODE_02)

Frontend Development Only:
 ```bash
 cd src/ui-client
npm install
npm run dev
```
The frontend will proxy API requests to http://localhost:80 (see vite.config.ts).

Backend Development:
```bash
# Terminal 1: CMS Service
cd src/CMS.Service
dotnet run

# Terminal 2: Gateway (YARP)
cd src/Gateway.Yarp
dotnet run
```

## Project structure
```
DistributedSystem/
├── src/
│   ├── CMS.Service/              # Microservice instances
│   ├── Gateway.Yarp/             # Reverse proxy + static file host
│   └── ui-client/                # React + TypeScript frontend
├── scripts/
│   ├── deploy-node.sh            # Azure deployment automation
│   └── cleanup-resources.sh      # Resource cleanup
├── .github/workflows/
│   └── deploy.yaml               # CI/CD pipeline
├── docker-compose.yml            # Local development orchestration
└── DistributedSystem.slnx        # .NET solution file
```