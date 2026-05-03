# Distributed System for the Content Management (CMS)

A cloud-native distributed content management system built with .NET 10, React 19, and container-based deployment. This repository combines a YARP Gateway, multiple CMS service nodes, and a React frontend to demonstrate modern microservices, load balancing, and Azure Container Apps CI/CD.

## Architecture Overview

### Components

- **Gateway (YARP)**: Reverse proxy in `src/Gateway.Yarp/` that routes requests and serves the built React UI from `wwwroot`
- **CMS Service**: Core microservice in `src/CMS.Service/` providing content management APIs and node identity via `NODE_ID`
- **UI Client**: React + TypeScript frontend in `src/ui-client/` using Redux Toolkit and RTK Query
- **Database Replication**: Local PostgreSQL master/slave setup in Docker Compose
- **Object Storage**: MinIO S3-compatible storage used for file handling

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | .NET 10, Node.js 24 |
| **Container Orchestration** | Docker, Docker Compose, Azure Container Apps |
| **Frontend** | React 19, TypeScript, Material-UI, SCSS |
| **Backend** | ASP.NET Core 10, YARP, Entity Framework Core 10 |
| **State Management** | Redux Toolkit, RTK Query |
| **Database** | PostgreSQL 16 (Docker Compose) |
| **Storage** | MinIO (S3-compatible) |
| **CI/CD** | GitHub Actions, Azure Container Registry |
| **Build Tools** | Vite, ESLint, TypeScript Compiler |

## Quick Start

### Local Development with Docker Compose

```bash
docker-compose up --build
```

This starts:
- `Gateway`: http://localhost:80
- `CMS Service node 1`: internal container `cms-1`
- `CMS Service node 2`: internal container `cms-2`
- `PostgreSQL master`: `db-master`
- `PostgreSQL slave`: `db-slave`
- `MinIO storage`: http://localhost:9000 (console at http://localhost:9001)

### Frontend Development Only

```bash
cd src/ui-client
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:3000` and proxies API requests to `http://localhost:80`.

### Backend Development

```bash
# Terminal 1: CMS Service
cd src/CMS.Service
dotnet run

# Terminal 2: Gateway (YARP)
cd src/Gateway.Yarp
dotnet run
```

## Deployment

The project includes a GitHub Actions workflow at `.github/workflows/deploy.yaml` that:
- provisions Azure infrastructure with Terraform from `infrastructure/terraform`
- builds and pushes Docker images to Azure Container Registry
- updates Azure Container Apps for the gateway and CMS service

## Project structure

```text
DistributedSystem/
├── .github/
│   └── workflows/               # CI/CD pipeline
├── infrastructure/
│   └── terraform/               # Azure provisioning templates
├── scripts/
│   ├── cleanup-resources.sh     # Resource cleanup
│   └── deploy-node.sh           # Azure deployment automation
├── docker-compose.yml           # Local development orchestration
├── DistributedSystem.slnx       # .NET solution file
└── src/
    ├── CMS.Service/             # ASP.NET Core CMS microservice
    ├── Gateway.Yarp/            # YARP reverse proxy + static file host
    └── ui-client/               # React + TypeScript frontend
```

## Notes

- `src/ui-client/vite.config.ts` proxies `/api` requests to the gateway during frontend development.
- `src/Gateway.Yarp/Program.cs` configures YARP reverse proxy and serves SPA static assets with fallback to `index.html`.
- `npm run build` in `src/ui-client/` outputs the production bundle to `src/Gateway.Yarp/wwwroot/`.
- Docker Compose uses PostgreSQL `16-alpine` and MinIO for local infrastructure testing.
