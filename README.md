# Farmers Market Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).  
The project uses **Tailwind CSS** for styling, and **Prisma** with **PostgreSQL** for the backend.

---

## Introduction

This project aims to build an online **farmers marketplace**. There are three user roles on the website:

- **Customer**
- **Farmer**
- **Admin**

---

### Customer Features

- Browse products by category
- Browse products by farmer stores
- Filter products by price and category
- Search for products and farmers
- Add products to the cart and place orders
- View and manage their orders

---

### Farmer Features
 - Create a store
 - Upload/Edit/Delete products
 - View orders and Edit order status 
 - Edit personal profile and store profile

 ---

 ### Admin Features 
- View daily/weekly/monthly transaction analysis
- View and manage customer and farmer information
 

# Getting Started

## Option 1: Using Docker
Before you start, make sure:

- Docker and Docker Compose are installed on your machine.
  - [Install Docker](https://docs.docker.com/get-docker/) if you haven't already.
- The Docker Desktop application is **opened and running** on your laptop when you run the project.

---

Follow these steps to get the project up and running:

1. Download the zip file from the `main` branch.
2. Extract the zip file and navigate to the project directory:
   ```bash
   cd 9900-project
   ```
3. Build and run the containers using Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Open your browser and visit: [http://localhost:3000](http://localhost:3000) to view the frontend web page.
   - To log in as an admin, change the URL in your browser to:
    ```bash
    http://localhost:3000/login-page?mode=admin
    ```
    
    This will take you directly to the admin login interface. 

    Login using following email and password:

    **Email:**

    ``` bash 
    admin@farmersmarket.com
    ```

    **Password:**
    ``` bash
    admin123
    ```
    
 5. To view the visualized database (via Prisma Studio), go to: [http://localhost:5555](http://localhost:5555)

---

## Troubleshooting

### Common Errors

- **Error message 1:**
  ```
  Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:5432 -> 127.0.0.1:0: listen tcp 0.0.0.0:5432: bind: address already in use
  ```
  **Cause:**  
  This means that another service (such as a local PostgreSQL server) is already using port `5432`.

   **Solutions:**
  - **Option 1:** Stop the service currently using port 5432.
    - On Mac/Linux:
      ```bash
      sudo lsof -i :5432
      ```
      Find the PID (Process ID) and kill the process:
      ```bash
      sudo kill -9 <PID>
      ```
    - On Windows:
      Open Command Prompt as Administrator:
      ```cmd
      netstat -ano | findstr :5432
      taskkill /PID <PID> /F
      ```
  - **Option 2:**  Restart your laptop to free up the port, then re-run the project following the steps above.

---

- **Error message 2:**
```
ERROR: for prisma-studio  'ContainerConfig'

ERROR: for backend  'ContainerConfig'

ERROR: for studio  'ContainerConfig'

ERROR: for backend  'ContainerConfig'
Traceback (most recent call last):
  File "/Library/Frameworks/Python.framework/Versions/3.9/bin/docker-compose", line 8, in <module>
    sys.exit(main())
  File "/Library/Frameworks/Python.framework/Versions/3.9/lib/python3.9/site-packages/compose/cli/main.py", line 81, in main
    command_func()
  File "/Library/Frameworks/Python.framework/Versions/3.9/lib/python3.9/site-packages/compose/cli/main.py", line 203, in perform_command
   ......
   ......

container.image_config['ContainerConfig'].get('Volumes') or {}
KeyError: 'ContainerConfig'
```
**Cause:**  
  This usually happens because the existing Docker volumes or containers are corrupted or not properly cleaned up from a previous failed setup.

   **Solutions:**
  - **Option 1:**  
    Go to Docker Desktop, manually **stop** and **remove** all containers related to this project.  
    Then, remove the volume named `9900-project_pgdata`:
    - Open Docker Desktop → **Volumes** → find and delete `9900-project_pgdata`.
  - **Option 2:**  
    Run the following commands in your terminal to remove volumes and clean up:
    ```bash
    docker-compose down -v
    docker volume prune
    ```
    Then re-run the project using:
    ```bash
    docker-compose up --build
    ```

---

## Option 2: Run Locally 


### Step1: Starting the Backend Server

```bash
cd backend
npm install
node server.js
```

The backend server will run on [http://localhost:5001](http://localhost:5001)

### Step2: Starting the Frontend Server

In a new terminal, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Step 3: (Optional but Highly Recommended) Run the Seeder Script

When you first set up the website, there are no products or farmer stores displayed.  
We **highly recommend** running the `seed.js` script to generate some initial data for testing and browsing.

To run the seeder:

1. Go back to the `backend` directory:
   ```bash
   cd backend
   ```
2. Execute the seed script:
   ```bash
   npm run seed.js
   ```

After running the seeder, you will see sample products and stores on the website!

### Step 4: (Optional) Visualize the Database

You can visualize and browse the database easily using Prisma Studio.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run Prisma Studio:
   ```bash
   npx prisma studio
   ```

Prisma Studio will open a new browser window at [http://localhost:5555](http://localhost:5555), where you can view and edit your database data.

---

### Step 5: Access the Admin Login Page

To log in as an admin, change the URL in your browser to:

```bash
http://localhost:3000/login-page?mode=admin
```

This will take you directly to the admin login interface. 

Login using following email and password:

**Email:**

``` bash 
admin@farmersmarket.com
```

**Password:**
``` bash
admin123
```

