import { expect, test } from "@playwright/test";
import { execSync } from "child_process";
import moment from "moment";

test.describe("Orders page", () => {
  test.use({ storageState: "playwright-storage/user.json" });

  test.beforeEach(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });

  test.afterEach(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });

  test("should successfully navigate to the user dashboard when clicking the dashboard link", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await expect(
      page.getByRole("button", { name: "Playwright User Account" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Playwright User Account" })
    ).toContainText("Playwright User Account");
    await page.getByRole("button", { name: "Playwright User Account" }).click();

    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toContainText(
      "Dashboard"
    );
    await page.getByRole("link", { name: "Dashboard" }).click();

    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Dashboard");
  });

  test("should successfully navigate to the orders page when clicking the orders link in the user dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard/user");
    await page.waitForLoadState("load");

    await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" })).toContainText(
      "Orders"
    );
    await page.getByRole("link", { name: "Orders" }).click();

    await expect(
      page.getByRole("heading", { name: "All Orders" })
    ).toBeVisible();
    await expect(page.locator("h1")).toContainText("All Orders");
  });

  test("should display order details, including order status, buyer's name, order date, payment status, and product quantity", async ({
    page,
  }) => {
    await page.goto("/dashboard/user/orders");
    await page.waitForLoadState("load");

    await expect(page.getByRole("columnheader", { name: "#" })).toBeVisible();
    await expect(page.locator("thead")).toContainText("#");
    await expect(page.getByRole("cell", { name: "1" })).toBeVisible();
    await expect(page.locator("tbody")).toContainText("1");

    await expect(
      page.getByRole("columnheader", { name: "Status" })
    ).toBeVisible();
    await expect(page.locator("thead")).toContainText("Status");
    await expect(page.getByRole("cell", { name: "Not Process" })).toBeVisible();
    await expect(page.locator("tbody")).toContainText("Not Process");

    await expect(
      page.getByRole("columnheader", { name: "Buyer" })
    ).toBeVisible();
    await expect(page.locator("thead")).toContainText("Buyer");
    await expect(
      page.getByRole("cell", { name: "Playwright User Account" })
    ).toBeVisible();
    await expect(page.locator("tbody")).toContainText(
      "Playwright User Account"
    );

    await expect(
      page.getByRole("columnheader", { name: "Date" })
    ).toBeVisible();
    await expect(page.locator("thead")).toContainText("Date");
    const since = moment("2025-02-04T13:42:16.741Z").fromNow();
    await expect(page.getByRole("cell", { name: since })).toBeVisible();
    await expect(page.locator("tbody")).toContainText(since);

    await expect(
      page.getByRole("columnheader", { name: "Payment" })
    ).toBeVisible();
    await expect(page.locator("thead")).toContainText("Payment");
    await expect(page.getByRole("cell", { name: "Failed" })).toBeVisible();
    await expect(page.locator("tbody")).toContainText("Failed");

    await expect(
      page.getByRole("columnheader", { name: "Quantity" })
    ).toBeVisible();
    await expect(page.locator("thead")).toContainText("Quantity");
    await expect(page.getByRole("cell", { name: "3" })).toBeVisible();
    await expect(page.locator("tbody")).toContainText("3");
  });

  test("should display product details, including product images, name, description, and price", async ({
    page,
  }) => {
    await page.goto("/dashboard/user/orders");
    await page.waitForLoadState("load");

    await expect(page.getByRole("img", { name: "NUS T-shirt" })).toBeVisible();
    await expect(page.getByText("NUS T-shirt", { exact: true })).toBeVisible();
    await expect(page.getByRole("main")).toContainText("NUS T-shirt");
    await expect(page.getByText("Plain NUS T-shirt for sale")).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      "Plain NUS T-shirt for sale"
    );
    await expect(page.getByText("Price : 4.99")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Price : 4.99");

    await expect(
      page.getByRole("img", { name: "Laptop" }).first()
    ).toBeVisible();
    await expect(page.getByText("Laptop").first()).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Laptop");
    await expect(page.getByText("A powerful laptop").first()).toBeVisible();
    await expect(page.getByRole("main")).toContainText("A powerful laptop");
    await expect(page.getByText("Price :").nth(1)).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Price : 1499.99");

    await expect(
      page.getByRole("img", { name: "Laptop" }).nth(1)
    ).toBeVisible();
    await expect(page.getByText("Laptop").nth(2)).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Laptop");
    await expect(page.getByText("A powerful laptop").nth(1)).toBeVisible();
    await expect(page.getByRole("main")).toContainText("A powerful laptop");
    await expect(page.getByText("Price :").nth(2)).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Price : 1499.99");
  });
});
