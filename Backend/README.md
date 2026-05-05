

##  Backend Service — Docker Setup Guide

##  Prerequisites

Ensure the following are installed and running on your system:

-   Docker (Engine)
-   Docker Compose
-   Make sure blockchain is running 
    

----------

##  Start the Backend Service

From the project **`Backend`** directory, run:

```bash
cd Backend
docker compose up -d --build

```

This will:

-   Build the Docker images
    
-   Start all services in detached mode
    

----------

##  View Logs

To monitor application logs in real-time:

```bash
docker compose logs -f

```

----------

##  Stop and Remove Containers

To stop and clean up all running containers:

```bash
docker compose down

```

----------

##  Environment Configuration

Configure environment variables in the **`.env`** file located in the `Backend` directory.

###  Certificate Storage

-   **`CERTIFICATE_STORAGE_PDF_PATH`**  
    Path where generated certificates will be stored.  
    **Example:**
    
    ```
    E:/DRDO PROJECT FINAL/Backend/ServerStorage/certificates
    
    ```
    

----------

###  Blockchain (Hyperledger Fabric)

-   **`FABRIC_ORGS_HOST_PATH`**  
    Path to Fabric organizations directory (used for external Hyperledger Fabric network integration).
    

----------

##  Default User Accounts

Use the following credentials to access the system after startup:

| Role        | Email                         | Password     | Name              |
|------------|------------------------------|--------------|------------------|
| **Admin**    | [admin@certportal.com](mailto:admin@certportal.com) | Admin@123    | System Admin      |
| **HR**       | [hr@certportal.com](mailto:hr@certportal.com)       | Hr@123       | Default HR        |
| **Director** | [director@certportal.com](mailto:director@certportal.com) | Director@123 | Default Director  |

----------
##  Notes

- Ensure all required paths specified in the `.env` file exist on your system.
- Update Hyperledger Fabric environment variables according to your local setup and network configuration.
    

