# CS4218 Group Project (Team 46)

# Milestone 1

## Setup Instructions

### Step 1: Switch to the `main` Git Branch

- After cloning the repo, switch to the `main` git branch.

To switch to the `main` branch:

```
git switch main
```

### Step 2: Install npm Packages (Backend)

- At the root folder of the repository, install the necessary packages for backend.
- You should see a newly created `node_modules` folder in the root folder.

To install the packages for backend:

```
npm install
```

### Step 3: Install npm Packages (Frontend)

- At the `client` folder of the repository, install the necessary packages for frontend.
- You should see a newly created `node_modules` folder in the `client` folder.

To change directory to the `client` folder:

```
cd client
```

To install the packages for frontend:

```
npm install
```

### Step 4: Run Unit Tests

- At the root folder of the repository, run the npm scripts for unit tests.

To change directory back to the root folder:

```
cd ..
```

To run unit tests only for frontend:

```
npm run test:frontend
```

To run unit tests only for backend:

```
npm run test:backend
```

To run unit tests for both frontend and backend:

```
npm run test
```

### Step 5: Start Webserver (in Dev Mode)

- At the root folder of the repository, run the webserver to start the frontend and backend.

To start webserver for both frontend and backend:

```
npm run dev
```

To check if the frontend is running, open the following URL in your browser:

```
http://localhost:3000/
```

To check if the backend is running, open the following URL in your browser:

```
http://localhost:6060/
```

## Continuous Integration (CI) Run Links

CI run links for Milestone 1 submission:

- push event: https://github.com/cs4218/cs4218-2420-ecom-project-team46/actions/runs/13612058059/job/38050510104
- pull request event: https://github.com/cs4218/cs4218-2420-ecom-project-team46/actions/runs/13612053061/job/38050497777

## Unit Tests File / Component Allocation Breakdown

<table>
    <thead>
        <tr>
            <th> S/N </th>
            <th> Files / Components </th>
            <th> Assigned </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td> 1 </td>
            <td>
                <ul>
                    <li> ./client/src/hooks/useCategory.js </li>
                    <li> ./client/src/context/cart.js </li>
                    <li> ./client/src/App.js </li>
                    <li> ./client/src/pages/Auth/Login.js </li>
                    <li> ./controllers/authController.js </li>
                    <ul> 
                        <li>registerController</li>
                        <li>loginController</li>
                        <li>forgotPasswordController</li>
                        <li>testController</li>
                    </ul>
                    <li> ./client/src/pages/Auth/Register.js </li>
                    <li> ./middlewares/authMiddleware.js </li>
                    <li> ./client/src/index.js </li>
                    <li> ./helpers/authHelper.js </li>
                    <li> ./client/src/context/auth.js </li>
                    <li> ./client/src/context/search.js </li>
                </ul>
            </td>
            <td> Lin Xingting </td>
        </tr>
        <tr>
            <td> 2 </td>
            <td>
                <ul>
                    <li> ./client/src/pages/admin/Users.js </li>
                    <li> ./server.js </li>
                    <li> ./client/src/components/AdminMenu.js </li>
                    <li> ./models/categoryModel.js </li>
                    <li> ./client/src/pages/admin/AdminDashboard.js </li>
                    <li> ./models/userModel.js </li>
                    <li> ./models/orderModel.js </li>
                    <li> ./client/src/components/Routes/Private.js </li>
                    <li> ./client/src/components/UserMenu.js </li>
                    <li> ./models/productModel.js </li>
                    <li> ./client/src/pages/user/Dashboard.js </li>
                    <li> ./client/src/components/Routes/AdminRoute.js </li>
                    <li> ./client/src/pages/user/Profile.js </li>
                    <li> ./client/src/pages/CartPage.js </li>
                    <li> ./controllers/authController.js </li>
                    <ul> 
                        <li>updateProfileController</li>
                        <li>getAllUsersController</li>
                    </ul>
                    <li> ./config/db.js </li>
                </ul>
            </td>
            <td> Lam Jiu Fong </td>
        </tr>
        <tr>
            <td> 3 </td>
            <td>
                <ul>
                    <li> ./controllers/categoryController.js </li>
                    <li> ./client/src/pages/admin/CreateCategory.js </li>
                    <li> ./client/src/pages/Categories.js </li>
                    <li> ./client/src/components/Form/CategoryForm.js </li>
                    <li> ./client/src/pages/Search.js </li>
                    <li> ./client/src/pages/CategoryProduct.js </li>
                    <li> ./controllers/productController.js </li>
                    <ul> 
                        <li>searchProductController</li>
                        <li>relatedProductController</li>
                        <li>productCategoryController</li>
                    </ul>
                    <li> ./client/src/components/Form/SearchInput.js </li>
                </ul>
            </td>
            <td> Edmund Kwek Shi Kwang </td>
        </tr>
        <tr>
            <td> 4 </td>
            <td>
                <ul>
                    <li> ./client/src/pages/admin/Products.js </li>
                    <li> ./controllers/productController.js </li>
                    <ul> 
                        <li> productListController </li>
                        <li> createProductController </li>
                        <li> updateProductController </li>
                        <li> deleteProductController </li>
                        <li> getProductController </li>
                        <li> getSingleProductController </li>
                        <li> productCountController </li>
                        <li> productFiltersController </li>
                        <li> productPhotoController </li>
                    </ul>
                    <li> ./client/src/pages/admin/CreateProduct.js </li>
                    <li> ./client/src/pages/admin/UpdateProduct.js </li>
                    <li> ./client/src/pages/ProductDetails.js </li>                    
                </ul>
            </td>
            <td> Gerald Neo Ee Ren </td>
        </tr>
        <tr>
            <td> 5 </td>
            <td>
                <ul>
                    <li> ./client/src/components/Header.js </li>
                    <li> ./client/src/components/Layout.js </li>
                    <li> ./client/src/pages/HomePage.js </li>
                    <li> ./client/src/pages/user/Orders.js </li>
                    <li> ./client/src/pages/About.js </li>
                    <li> ./client/src/pages/Contact.js </li>
                    <li> ./client/src/components/Footer.js </li>
                    <li> ./controllers/productController.js </li>
                    <ul> 
                        <li>braintreeTokenController</li>
                        <li>brainTreePaymentController</li>
                    </ul>
                    <li> ./client/src/components/Prices.js </li>
                    <li> ./client/src/components/Spinner.js </li>
                    <li> ./client/src/pages/Policy.js </li>
                    <li> ./client/src/pages/Pagenotfound.js </li>
                    <li> ./client/src/pages/admin/AdminOrders.js </li>
                    <li> ./controllers/authController.js </li>
                    <ul> 
                        <li>getOrdersController</li>
                        <li>getAllOrdersController</li>
                        <li>orderStatusController</li>
                    </ul>
                </ul>
            </td>
            <td> Kew Kok Wen </td>
        </tr>
    </tbody>
</table>

# Milestone 2

## Running Integration Tests

### Step 1: Switch to the `main` Git Branch

- After cloning the repo, switch to the `main` git branch.

To switch to the `main` branch:

```
git switch main
```

### Step 2: Install npm Packages (Backend)

- At the root folder of the repository, install the necessary packages for backend.
- You should see a newly created `node_modules` folder in the root folder.

To install the packages for backend:

```
npm install
```

### Step 3: Install npm Packages (Frontend)

- At the `client` folder of the repository, install the necessary packages for frontend.
- You should see a newly created `node_modules` folder in the `client` folder.

To change directory to the `client` folder:

```
cd client
```

To install the packages for frontend:

```
npm install
```

### Step 4: Run Integration Tests

- At the root folder of the repository, run the npm scripts for integration tests.

To change directory back to the root folder:

```
cd ..
```

To run integration tests only for frontend:

```
npm run integration:frontend
```

To run integration tests only for backend:

```
npm run integration:backend
```

To run integration tests for both frontend and backend:

```
npm run integration
```

## Running UI Tests

### Step 1: Switch to the `main` Git Branch

- After cloning the repo, switch to the `main` git branch.

To switch to the `main` branch:

```
git switch main
```

### Step 2: Install npm Packages (Backend)

- At the root folder of the repository, install the necessary packages for backend.
- You should see a newly created `node_modules` folder in the root folder.

To install the packages for backend:

```
npm install
```

### Step 3: Install npm Packages (Frontend)

- At the `client` folder of the repository, install the necessary packages for frontend.
- You should see a newly created `node_modules` folder in the `client` folder.

To change directory to the `client` folder:

```
cd client
```

To install the packages for frontend:

```
npm install
```

### Step 4: Start Webserver (in Dev Mode)

- At the root folder of the repository, run the webserver to start the frontend and backend.

To change directory back to the root folder:

```
cd ..
```

To start webserver for both frontend and backend:

```
npm run dev
```

To check if the frontend is running, open the following URL in your browser:

```
http://localhost:3000/
```

To check if the backend is running, open the following URL in your browser:

```
http://localhost:6060/
```

### Step 5: Run UI Tests

- At the root folder of the repository, run the npm scripts for UI tests.
- Before running the tests, ensure that the web application is already up.
- The UI tests are configured to use the admin/user credentials (or as non logged in visitors) specified in `playwright-global-setup.cjs`.
- <b>IMPORTANT NOTE:</b>
  - Some of the UI tests would involve creation/update/deletion of products/categories/users etc.
  - To avoid flaky tests due to test pollution, the UI tests are configured to reset the MongoDB data before/after each test. Thus, the UI tests should only be run with one worker, as multiple workers would cause race conditions.
  - DO NOT use `npx playwright test` to run the UI tests as multiple workers would be run by default and this would create a race condition where the mongodb would be accessed and modified by multiple workers running in parallel. Please use the command below to ensure deterministic outcomes.
  - The MongoDB (`MONGO_URL` specified in `.env`) data will be deleted and reloaded (using the sample data provided) multiple times during the UI tests.
  - DO NOT RUN this on any production database or any database where you would not want your data to be deleted/modified.

To run UI tests:

```
npm run playwright
```

## Running Sonarqube Coverage

### Requires

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/)

## Step 1: Installing Docker Desktop

- Go to the official [docker website](https://www.docker.com/products/docker-desktop/) to download Docker Desktop software.
- Check that you have the software installed and running by the command `docker --version` on your CLI.
- You should see something like this on your CLI.

```
docker --version
>> Docker version 27.5.1, build 9f9e405
```

## Step 2: Installing Docker Compose

- Check that you have docker compose installed by running the command `docker compose version` on your CLI.
- You should see something like this on your CLI.

```
docker compose version
>> Docker Compose version v2.32.4-desktop.1
```

- Else, please follow the instructions [here](https://docs.docker.com/compose/install/) to install docker compose (preferably v2.x, if possible) on your computer.

## Step 3: Start Sonarqube and underlying DB

- Start Sonarqube and its underlying database.
- Default username: `admin`
- Default password: `admin`
- You will be prompted to change password upon first login.

To start up the sonarqube and postgres DB:

```
docker compose -f 'docker-compose.sonarqube.yml' up -d --build 'sonar_db' 'sonarqube'
```

To check if you have successfully start Sonarqube by opening this link in the browser:

```
http://localhost:9001
```

## Step 3: Create Sonarqube token

- Go to `My Account` > `Security` to generate a `Global Analysis Token`
- Copy the token value and update the token in the following files:
  - sonar-project.properties
  - docker-compose.sonarqube.yml

## Step 4: Run Jest Coverage

- Run jest coverage using npm.
- The output will be stored in the `coverage` folder by default.

To run Jest coverage:

```
npm run coverage
```

## Step 5: Run Sonarqube Coverage Report

- Run the Sonarqube coverage report by starting the `sonar-scanner` service in docker compose.

To run Sonarqube coverage report:

```
docker compose -f 'cs4218-2420-ecom-project-team46/docker-compose.sonarqube.yml' up -d --build 'sonar-scanner'
```

To view logs:

```
docker logs sonar-scanner -f
```

## Step 6: Access the Sonarqube Coverage Report

- View the report using Sonarqube UI.

To access coverage report by opening this link in the browser:

```
http://localhost:9001/component_measures?metric=coverage&view=list&id=econ
```

## Step 7: Shutdown Docker Compose Services

To stop docker compose services:

```
docker compose -f 'docker-compose.sonarqube.yml' down
```

## Integration and UI Test Files Breakdown

<table>
    <thead>
        <tr>
            <th> S/N </th>
            <th> Assigned </th>
            <th> Integration Test Files </th>
            <th> UI Test Files </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td> 1 </td>
            <td> Lin Xingting </td>
            <td>
                <ul>
                    <li></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td> 2 </td>
            <td> Lam Jiu Fong </td>
            <td>
                <ul>
                    <li></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td> 3 </td>
            <td> Edmund Kwek Shi Kwang </td>
            <td>
                <ul>
                    <li> ./integration-tests/category-management.integration.test.js </li>
                    <li> ./integration-tests/category-product.integration.test.js </li>
                    <li> ./integration-tests/search.integration.test.js </li>
                    <li> ./client/src/integration-tests/category-management.integration.test.js </li>
                    <li> ./client/src/integration-tests/category-product.integration.test.js </li>
                    <li> ./client/src/integration-tests/search.integration.test.js </li>
                </ul>
            </td>
            <td>
                <ul>
                    <li> ./ui-tests/categories-mgmt.spec.cjs </li>
                    <li> ./ui-tests/categories.spec.cjs </li>
                    <li> ./ui-tests/category-product.spec.cjs </li>
                    <li> ./ui-tests/search.spec.cjs </li>
                </ul>
            </td>
        </tr>
        <tr>
            <td> 4 </td>
            <td> Gerald Neo Ee Ren </td>
            <td>
                <ul>
                    <li>./integration-tests/productController.integration.test.js</li>
                    <li>./client/src/integration-tests/product.integration.test.js</li>
                </ul>
            </td>
            <td>
                <ul>
                    <li>./ui-tests/prodcts-add-to-cart-flow.spec.cjs</li>
                    <li>./ui-tests/prodcts-crud.spec.cjs</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td> 5 </td>
            <td> Kew Kok Wen </td>
            <td>
                <ul>
                    <li></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li></li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>
