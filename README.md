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
            <th> 1 </th>
            <th>
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
            </th>
            <th> Lin Xingting </th>
        </tr>
        <tr>
            <th> 2 </th>
            <th>
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
            </th>
            <th> Lam Jiu Fong </th>
        </tr>
        <tr>
            <th> 3 </th>
            <th>
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
            </th>
            <th> Edmund Kwek Shi Kwang </th>
        </tr>
        <tr>
            <th> 4 </th>
            <th>
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
            </th>
            <th> Gerald Neo Ee Ren </th>
        </tr>
        <tr>
            <th> 5 </th>
            <th>
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
            </th>
            <th> Kew Kok Wen </th>
        </tr>
    </tbody>
</table>
