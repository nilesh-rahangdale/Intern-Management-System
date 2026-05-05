

##  Frontend Service — Docker Setup Guide


##  Prerequisites

Before starting the frontend service, ensure:

- Docker (Engine) and Docker Compose are installed and running
- Backend service is running and reachable
- Blockchain (Hyperledger Fabric) containers are up and properly configured

---

## Build and Run the Frontend

From the project **`Frontend`** directory, execute:

```bash
cd Frontend

docker build  --build-arg VITE_BACKEND_URL=http://localhost:8080 -t intern-management-frontend .

docker run -d -p 5173:80  --name intern-management-frontend intern-management-frontend

```

## Configuration

-   **`VITE_BACKEND_URL`**  
    Specifies the backend API URL used by the frontend application.
    
    Update this value if your backend is running on a different host or port.  
    Example:
    
    ```bash
    --build-arg VITE_BACKEND_URL=http://host.docker.internal:8080
    
    ```
    

----------

##  Stop and Remove Container

To stop and remove the running container:

```bash
docker rm -f intern-management-frontend
```

----------

##  Notes

-   Ensure the backend and blockchain service is running and accessible before starting the frontend.
    
-   Port **5173** on your host is mapped to port **80** inside the container.
    
-   Modify the port mapping if needed (e.g., `-p 3000:80`).
    

