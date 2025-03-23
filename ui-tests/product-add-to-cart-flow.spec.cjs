import { test } from "@playwright/test";
import { execSync } from "child_process";

test.describe("Product add to cart flow tests", () => {
  test.use({ storageState: "playwright-storage/admin.json" });

  test.beforeAll(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });

  test.afterAll(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });
  test("should show products added to cart in homepage on cart page", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page
      .locator(".card-name-price > button:nth-child(2)")
      .first()
      .click();
    await page
      .locator(
        "div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)"
      )
      .click();
    await page.getByRole("listitem").filter({ hasText: "Cart2" }).click();
    await page.getByText("TextbookA comprehensive").click();
    await page.getByText("LaptopA powerful laptopPrice :").click();
  });

  test("should show products added to cart in product details page on cart page", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page
      .locator("div:nth-child(3) > .card-body > div:nth-child(3) > button")
      .first()
      .click();
    await page.getByTestId("add-to-cart").click();
    await page.getByRole("link", { name: "Cart" }).click();
    await page.getByText("SmartphoneA high-end").click();
  });

  test("should show products added to cart from similar products on cart page", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.locator(".card-name-price > button").first().click();
    await page.getByTestId("add-to-cart-related").first().click();
    await page.getByTestId("add-to-cart-related").nth(1).click();
    await page.getByRole("link", { name: "Cart" }).click();
    await page.getByText("NovelA bestselling novelPrice :").click();
    await page
      .getByText(
        "The Law of Contract in SingaporeA bestselling book in SingaporPrice :"
      )
      .click();
  });
});
