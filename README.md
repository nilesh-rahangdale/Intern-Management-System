# Blockchain-Enabled Secure Intern and Digital Certificate Management System

A comprehensive full-stack application for managing internship programs at Scientific Analysis Group, DRDO , featuring blockchain-based certificate verification, user authentication, and role-based access control.

## Project Overview

This system enables efficient management of internships and digital certificate generation with blockchain-based verification. It includes separate modules for administrators, HR personnel, directors.

## Architecture

The project is organized into three main components:

### 1. **Backend** (`Backend/`)
Spring Boot-based REST API with certificate management and blockchain integration.

**Technology Stack:**
- Java with Spring Boot
- Maven for build automation
- Docker containerization
- Blockchain integration for certificate verification

**Key Features:**
- User management and authentication
- Certificate generation and management
- Intern profile management
- Role-based access control (RBAC)
- Secure API endpoints

**Setup:**
```
Refer to the Backend README for detailed setup instructions and API documentation.
```

### 2. **Blockchain** (`Blockchain/`)
Hyperledger Fabric-based blockchain network for immutable certificate storage and verification.

**Technology Stack:**
- Hyperledger Fabric
- Go chaincode
- Docker Compose for network orchestration

**Key Components:**
- Certificate contract for recording and verifying certificates
- Network configuration and channel setup
- Certificate Authority (CA) setup
- Peer and orderer configurations

**Setup:**
```
Refer to the Blockchain README for detailed network setup and chaincode deployment instructions.
```

### 3. **Frontend** (`Frontend/`)
Modern React-based web application with role-based dashboards.

**Technology Stack:**
- React 18+ with Vite
- Redux for state management
- Axios for API integration
- Nginx for containerized deployment

**Key Features:**
- Admin dashboard for system management
- HR dashboard for intern management
- Director dashboard for review and approval
- Intern dashboard for viewing certificates and profile
- Authentication and session management
- Responsive UI with Material Design

**Setup:**
```
Refer to the Frontend README for detailed setup instructions and development guidelines.
```

## Getting Started

### Prerequisites
- Java 11+ (for Backend)
- Node.js 16+ (for Frontend)
- Docker & Docker Compose
- Git

### Quick Start

Refer to the respective module READMEs for detailed instructions.
main steps:

1. **Clone the Repository**

2. **Start Blockchain Network** (in new terminal)

3. **Start Backend** (in new terminal)

4. **Start Frontend** (in new terminal)

## Project Structure

```
DRDO PROJECT FINAL/
├── Backend/                 # Spring Boot REST API
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
├── Blockchain/              # Hyperledger Fabric Network
│   ├── chaincode/
│   ├── config/
│   ├── docker/
│   ├── startNetwork.sh
│   ├── stopNetwork.sh
│   └── README.md
├── Frontend/                # React Web Application
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.js
│   └── README.md
└── README.md               # This file
```

## Features

### User Management
- **Admin**: Full system access, user management, configuration
- **HR**: Intern Management , certificate issuance
- **Director**: Certificate approval workflow
### Certificate Management
- Digital certificate generation
- Blockchain-based verification
- Historical record maintenance
- Status tracking (pending, approved, issued, revoked)

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- HTTPS support
- Secure certificate storage
- Blockchain immutability for audit trail

## API Documentation

Refer to the [API DOCUMENTATION README](Backend\API_DOCUMENTATION.md) for detailed API documentation and endpoints.

Refer to the [Backend README](Backend\README.md) for backend setup.

## Blockchain Documentation

Refer to the [Blockchain README](Blockchain/README.md) for network setup, chaincode deployment, and channel management.

## Frontend Documentation

Refer to the [Frontend README](Frontend/README.md) for component structure, routing, and development guidelines.

## Development Guidelines

### Backend
- Follow Spring Boot best practices
- Use Maven for dependency management
- Run unit tests: `./mvnw test`
- Build package: `./mvnw clean package`

### Frontend
- Follow React functional component patterns
- Use Redux for global state management
- Run ESLint: `npm run lint`
- Build for production: `npm run build`

### Blockchain
- Review Hyperledger Fabric documentation
- Test chaincode locally before deployment
- Maintain network configuration files



## Troubleshooting

### Port Already in Use
- Backend default: 8080
- Frontend default: 5173
- Blockchain ports: 7050-7052

### Docker Issues
- Ensure Docker daemon is running
- Check docker-compose version compatibility
- Review service logs: `docker logs <container_id>`

### Build Failures
- Clear cache: `mvn clean` or `npm cache clean --force`
- Verify JDK version for Backend
- Update Node.js and npm for Frontend

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Await code review

## License

This project is developed for SAG, DRDO .

## Support

For issues and questions:
1. Check the respective module's README
2. Review API documentation
3. Contact to [nileshrahangdale08@gmail.com](mailto:nileshrahangdale08@gmail.com)

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

