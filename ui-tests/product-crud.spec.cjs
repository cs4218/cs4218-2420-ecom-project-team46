import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

test.describe("Product Admin Panel CRUD tests", () => {
  test.use({ storageState: "playwright-storage/admin.json" });

  test.beforeEach(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });

  test.afterEach(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });
  test.describe("CREATE tests", () => {
    test("should create product successfully", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/admin/create-product");
      await page.locator("#rc_select_0").click();
      await page.getByTitle("Electronics").locator("div").click();
      await page.getByRole("textbox", { name: "write a name" }).click();
      await page
        .getByRole("textbox", { name: "write a name" })
        .fill("Playwright Test Product");
      await page.getByRole("textbox", { name: "write a description" }).click();
      await page
        .getByRole("textbox", { name: "write a description" })
        .fill("Playwright Test Product");
      await page.getByPlaceholder("write a Price").click();
      await page.getByPlaceholder("write a Price").fill("1");
      await page.getByPlaceholder("write a quantity").click();
      await page.getByPlaceholder("write a quantity").fill("1");
      await page.locator("#rc_select_1").click();
      await page.getByText("No").click();
      await page.getByRole("button", { name: "CREATE PRODUCT" }).click();
      await page.getByRole("link", { name: "Playwright Test Product" }).click();
      await page.goto("http://localhost:3000/dashboard/admin/products");
      await expect(
        page.getByRole("link", { name: "Playwright Test Product" })
      ).toBeVisible();
      await page.goto("http://localhost:3000/");
      await expect(page.getByRole("main")).toContainText(
        "Playwright Test Product"
      );
    });
    test("should fail to create product with missing field", async ({
      page,
    }) => {
      await page.goto("http://localhost:3000/dashboard/admin/create-product");
      await page.getByRole("button", { name: "CREATE PRODUCT" }).click();
      await expect(page.getByRole("status")).toContainText(
        "something went wrong"
      );
    });
  });
  test.describe("READ tests", () => {
    test("should display all products on /admin/products", async ({ page }) => {
      await page.goto("localhost:3000/dashboard/admin/products");
      const productNames = [
        "Novel",
        "The Law of Contract in Singapore",
        "NUS T-shirt",
        "Smartphone",
        "Laptop",
        "Textbook",
      ];
      for (const productName of productNames) {
        await expect(page.getByRole("main")).toContainText(productName);
      }
    });
    test("should lead to update product page with product details when product is clicked", async ({
      page,
    }) => {
      await page.goto("localhost:3000/dashboard/admin/products");
      await page
        .getByRole("link", { name: "Novel Novel A bestselling" })
        .click();
      await expect(page).toHaveURL(
        "http://localhost:3000/dashboard/admin/product/novel"
      );
    });
  });
  test.describe("Update tests", () => {
    test("should update product successfully via product details page", async ({
      page,
    }) => {
      await page.goto("localhost:3000/dashboard/admin/product/novel");
      await page.getByRole("textbox", { name: "write a name" }).dblclick();
      await page
        .getByRole("textbox", { name: "write a name" })
        .fill("Playwright Novel");
      await page.getByPlaceholder("write a Price").dblclick();
      await page.getByPlaceholder("write a Price").fill("20.99");
      await page.getByPlaceholder("write a quantity").dblclick();
      await page.getByPlaceholder("write a quantity").fill("10");
      await page.getByRole("button", { name: "UPDATE PRODUCT" }).click();
      await expect(page.getByRole("main")).toContainText("Playwright Novel");
      await page.goto("http://localhost:3000/product/Playwright-Novel");
      await expect(page.getByRole("main")).toContainText(
        "Name : Playwright Novel"
      );
    });
  });
  test.describe("Delete tests", () => {
    test("should delete product successfully via product details page", async ({
      page,
    }) => {
      await page.goto(
        "http://localhost:3000/dashboard/admin/product/smartphone"
      );
      page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
      });
      await page.getByRole("button", { name: "DELETE PRODUCT" }).click();
      await expect(page.getByRole("main")).not.toContainText("Smartphone");
      await page.goto("http://localhost:3000/");
      await expect(page.getByRole("main")).not.toContainText("Smartphone");
    });
  });
});
