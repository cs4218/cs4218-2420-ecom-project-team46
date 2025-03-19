import { expect, test } from "@playwright/test";
import { execSync } from "child_process";
import moment from "moment";

test.describe("Admin Orders page", () => {
  test.use({ storageState: "playwright-storage/admin.json" });

  test.beforeEach(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });

  test.afterEach(async ({}) => {
    execSync("npm run db:reset", { stdio: "inherit" });
  });

  test("should successfully navigate to the admin panel when clicking the dashboard link", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await expect(
      page.getByRole("button", { name: "Playwright Admin Account" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Playwright Admin Account" })
    ).toContainText("Playwright Admin Account");
    await page
      .getByRole("button", { name: "Playwright Admin Account" })
      .click();

    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toContainText(
      "Dashboard"
    );
    await page.getByRole("link", { name: "Dashboard" }).click();

    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Admin Panel");
  });

  test("should successfully navigate to the orders page when clicking the orders link in the admin dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard/admin");
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
    await page.goto("/dashboard/admin/orders");
    await page.waitForLoadState("load");

    await expect(page.getByRole("columnheader", { name: "#" })).toBeVisible();
    await expect(page.locator("thead")).toContainText("#");
    await expect(page.getByRole("cell", { name: "1" })).toBeVisible();
    await expect(page.locator("tbody")).toContainText("1");

    await expect(
      page.getByRole("columnheader", { name: "Status" })
    ).toBeVisible();
    await expect(page.locator("thead")).toContainText("Status");
    await expect(
      page
        .getByTestId("order-select-67a21938cf4efddf1e5358d1")
        .getByText("Not Process")
    ).toBeVisible();
    await expect(
      page.getByTestId("order-select-67a21938cf4efddf1e5358d1").locator("div")
    ).toContainText("Not Process");

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
    await page.goto("/dashboard/admin/orders");
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

  test("should display all available order statuses in the status dropdown menu when clicked", async ({
    page,
  }) => {
    await page.goto("/dashboard/admin/orders");
    await page.waitForLoadState("load");

    await expect(
      page
        .getByTestId("order-select-67a21938cf4efddf1e5358d1")
        .getByText("Not Process")
    ).toBeVisible();
    await page.getByTestId("order-select-67a21938cf4efddf1e5358d1").click();
    await expect(page.getByTitle("Not Processed")).toBeVisible();
    await expect(page.getByTitle("Not Processed")).toContainText(
      "Not Processed"
    );
    await expect(page.getByTitle("Processing")).toBeVisible();
    await expect(page.getByTitle("Processing")).toContainText("Processing");
    await expect(page.getByTitle("Shipped")).toBeVisible();
    await expect(page.getByTitle("Shipped")).toContainText("Shipped");
    await expect(page.getByTitle("Cancelled")).toBeVisible();
    await expect(page.getByTitle("Cancelled")).toContainText("Cancelled");
  });

  test("should display a toast notification and update the order status when a different status is selected from the status dropdown menu", async ({
    page,
  }) => {
    await page.goto("/dashboard/admin/orders");
    await page.waitForLoadState("load");

    await expect(
      page
        .getByTestId("order-select-67a21938cf4efddf1e5358d1")
        .getByText("Not Process")
    ).toBeVisible();
    await page.getByTestId("order-select-67a21938cf4efddf1e5358d1").click();
    await expect(page.getByTitle("Processing")).toBeVisible();
    await page.getByTitle("Processing").click();
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("status")).toContainText(
      "Order status successfully updated."
    );
    await expect(
      page.getByTestId("order-select-67a21938cf4efddf1e5358d1").locator("div")
    ).toContainText("Processing");
  });

  test("should not display toast notification when the order status remains unchanged from the current status", async ({
    page,
  }) => {
    await page.goto("/dashboard/admin/orders");
    await page.waitForLoadState("load");

    await expect(
      page
        .getByTestId("order-select-67a21938cf4efddf1e5358d1")
        .getByText("Not Process")
    ).toBeVisible();
    await page.getByTestId("order-select-67a21938cf4efddf1e5358d1").click();
    await expect(page.getByTitle("Processing")).toBeVisible();
    await page.getByTitle("Processing").click();
    await expect(page.getByRole("status")).not.toBeVisible();
    await expect(
      page.getByTestId("order-select-67a21938cf4efddf1e5358d1").locator("div")
    ).toContainText("Processing");
  });
});
