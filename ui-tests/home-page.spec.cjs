import { expect, test } from "@playwright/test";

const products = [
  {
    truncatedName: "Textbook",
    name: "Textbook",
    description: "A comprehensive textbook...",
    price: "$79.99",
  },
  {
    truncatedName: "Laptop",
    name: "Laptop",
    description: "A powerful laptop...",
    price: "$1,499.99",
  },
  {
    truncatedName: "Smartphone",
    name: "Smartphone",
    description: "A high-end smartphone...",
    price: "$999.99",
  },
  {
    truncatedName: "Novel",
    name: "Novel",
    description: "A bestselling novel...",
    price: "$14.99",
  },
  {
    truncatedName: "The Law of Contract in",
    name: "The Law of Contract in Singapore",
    description: "A bestselling book in",
    price: "$54.99",
  },
  {
    truncatedName: "NUS T-shirt",
    name: "NUS T-shirt",
    description: "Plain NUS T-shirt for sale...",
    price: "$4.99",
  },
];

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/product/product-filters") &&
        response.status() === 200
    );
    await page.goto("/");
    const response = await responsePromise;
    const responseBody = await response.json();
    expect(responseBody.products).toHaveLength(6);
  });

  test("should display header along with all its respective components", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: "🛒 Virtual Vault" })
    ).toBeVisible();
    await expect(page.locator("#navbarTogglerDemo01")).toContainText(
      "🛒 Virtual Vault"
    );

    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toContainText(
      "Search"
    );

    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toContainText(
      "Home"
    );

    await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Categories" })).toContainText(
      "Categories"
    );

    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toContainText(
      "Register"
    );

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toContainText(
      "Login"
    );

    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart" })).toContainText(
      "Cart"
    );

    await expect(page.getByRole("superscript")).toBeVisible();
    await expect(page.getByRole("superscript")).toContainText("0");
  });

  test("should display a drop down menu displaying all categories when the 'CATEGORIES' is clicked", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Categories" }).click();

    await expect(
      page.getByRole("link", { name: "All Categories" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "All Categories" })
    ).toContainText("All Categories");

    await expect(page.getByRole("link", { name: "Electronics" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Electronics" })).toContainText(
      "Electronics"
    );

    await expect(page.getByRole("link", { name: "Book" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book" })).toContainText(
      "Book"
    );

    await expect(page.getByRole("link", { name: "Clothing" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clothing" })).toContainText(
      "Clothing"
    );
  });

  test("should display banner", async ({ page }) => {
    await expect(page.getByRole("img", { name: "bannerimage" })).toBeVisible();
  });

  test("should display category filters", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Filter By Category" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Filter By Category" })
    ).toContainText("Filter By Category");

    await expect(
      page.getByRole("checkbox", { name: "Electronics" })
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Electronics", { exact: true })
    ).toBeVisible();

    await expect(page.getByRole("checkbox", { name: "Book" })).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Book", { exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole("checkbox", { name: "Clothing" })
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Clothing", { exact: true })
    ).toBeVisible();
  });

  test("should display price filters", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Filter By Price" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Filter By Price" })
    ).toContainText("Filter By Price");

    await expect(page.getByRole("radio", { name: "$0 to" })).toBeVisible();
    await expect(page.getByText("$0 to")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$0 to 19");

    await expect(page.getByRole("radio", { name: "$20 to" })).toBeVisible();
    await expect(page.getByText("$20 to")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$20 to 39");

    await expect(page.getByRole("radio", { name: "$40 to" })).toBeVisible();
    await expect(page.getByText("$40 to")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$40 to 59");

    await expect(page.getByRole("radio", { name: "$60 to" })).toBeVisible();
    await expect(page.getByText("$60 to")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$60 to 79");

    await expect(page.getByRole("radio", { name: "$80 to" })).toBeVisible();
    await expect(page.getByText("$80 to")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$80 to 99");

    await expect(
      page.getByRole("radio", { name: "$100 or more" })
    ).toBeVisible();
    await expect(page.getByText("$100 or more")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$100 or more");
  });

  test("should display reset filters button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "RESET FILTERS" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "RESET FILTERS" })
    ).toContainText("RESET FILTERS");
  });

  test("should display product catalogue", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "All Products" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "All Products" })
    ).toContainText("All Products");

    for (const [index, product] of products.entries()) {
      await expect(
        page.getByRole("img", { name: product.truncatedName })
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: product.truncatedName })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: product.truncatedName })
      ).toContainText(product.name);

      await expect(
        page.getByRole("heading", { name: product.price })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: product.price })
      ).toContainText(product.price);

      await expect(page.getByText(product.description)).toBeVisible();

      if (index === 0) {
        await expect(
          page.locator(".card-name-price > button").first()
        ).toBeVisible();
        await expect(
          page.locator(".card-name-price > button").first()
        ).toContainText("More Details");

        await expect(
          page.locator(".card-name-price > button:nth-child(2)").first()
        ).toBeVisible();
        await expect(
          page.locator(".card-name-price > button:nth-child(2)").first()
        ).toContainText("ADD TO CART");
      } else {
        await expect(
          page
            .locator(
              `div:nth-child(${
                index + 1
              }) > .card-body > div:nth-child(3) > button`
            )
            .first()
        ).toBeVisible();
        await expect(
          page
            .locator(
              `div:nth-child(${
                index + 1
              }) > .card-body > div:nth-child(3) > button`
            )
            .first()
        ).toContainText("More Details");

        await expect(
          page.locator(
            `div:nth-child(${
              index + 1
            }) > .card-body > div:nth-child(3) > button:nth-child(2)`
          )
        ).toBeVisible();
        await expect(
          page.locator(
            `div:nth-child(${
              index + 1
            }) > .card-body > div:nth-child(3) > button:nth-child(2)`
          )
        ).toContainText("ADD TO CART");
      }
    }
  });

  test("should toggle the display of products based on applied category filters", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/product/product-filters") &&
        response.status() === 200
    );

    await page.getByRole("checkbox", { name: "Book" }).check();
    const response = await responsePromise;
    const responseBody = await response.json();

    expect(responseBody.products).toHaveLength(3);

    await expect
      .poll(
        async () => {
          return page.getByText("Load more").count();
        },
        {
          timeout: 10000,
          interval: 500,
          message: "Pending for state update",
        }
      )
      .toBeGreaterThan(0);

    await expect(page.getByRole("heading", { name: "Textbook" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The Law of Contract in" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Laptop" })).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Smartphone" })
    ).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "NUS T-shirt" })
    ).toBeHidden();

    await page.getByRole("button", { name: "RESET FILTERS" }).click();

    await expect
      .poll(
        async () => {
          return page.getByText("Load more").count();
        },
        {
          timeout: 10000,
          interval: 500,
          message: "Pending for state update",
        }
      )
      .toEqual(0);

    for (const product of products) {
      await expect(
        page.getByRole("heading", { name: product.truncatedName })
      ).toBeVisible();
    }
  });

  test("should toggle the display of products based on applied price filters", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/product/product-filters") &&
        response.status() === 200
    );
    await page.getByRole("radio", { name: "$0 to" }).check();
    const response = await responsePromise;
    const responseBody = await response.json();

    expect(responseBody.products).toHaveLength(2);

    await expect
      .poll(
        async () => {
          return page.getByText("Load more").count();
        },
        {
          timeout: 10000,
          interval: 500,
          message: "Waiting for Load more to appear",
        }
      )
      .toBeGreaterThan(0);

    await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "NUS T-shirt" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Textbook" })).toBeHidden();
    await expect(page.getByRole("heading", { name: "Laptop" })).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Smartphone" })
    ).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "The Law of Contract in" })
    ).toBeHidden();

    await page.getByRole("button", { name: "RESET FILTERS" }).click();

    await expect
      .poll(
        async () => {
          return page.getByText("Load more").count();
        },
        {
          timeout: 10000,
          interval: 500,
          message: "Waiting for Load more to disappear",
        }
      )
      .toEqual(0);

    for (const product of products) {
      await expect(
        page.getByRole("heading", { name: product.truncatedName })
      ).toBeVisible();
    }
  });

  test("should toggle the display of products based on applied category and price filters", async ({
    page,
  }) => {
    const responsePromise1 = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/product/product-filters") &&
        response.status() === 200
    );

    await page.getByRole("checkbox", { name: "Book" }).check();

    const response1 = await responsePromise1;
    const responseBody1 = await response1.json();
    expect(responseBody1.products).toHaveLength(3);

    const responsePromise2 = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/product/product-filters") &&
        response.status() === 200
    );

    await page.getByRole("radio", { name: "$0 to" }).check();

    const response2 = await responsePromise2;
    const responseBody2 = await response2.json();
    expect(responseBody2.products).toHaveLength(1);

    await expect
      .poll(
        async () => {
          return page.getByText("Load more").count();
        },
        {
          timeout: 10000,
          interval: 500,
          message: "Waiting for Load more to appear",
        }
      )
      .toBeGreaterThan(0);

    await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Textbook" })).toBeHidden();
    await expect(page.getByRole("heading", { name: "Laptop" })).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Smartphone" })
    ).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "The Law of Contract in" })
    ).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "NUS T-shirt" })
    ).toBeHidden();

    await page.getByRole("button", { name: "RESET FILTERS" }).click();

    await expect
      .poll(
        async () => {
          return page.getByText("Load more").count();
        },
        {
          timeout: 10000,
          interval: 500,
          message: "Waiting for Load more to disappear",
        }
      )
      .toEqual(0);

    for (const product of products) {
      await expect(
        page.getByRole("heading", { name: product.truncatedName })
      ).toBeVisible();
    }
  });

  test("should display footer", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "All Rights Reserved ©" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "All Rights Reserved ©" })
    ).toContainText("All Rights Reserved © TestingComp");

    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toContainText(
      "About"
    );

    await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" })).toContainText(
      "Contact"
    );

    await expect(
      page.getByRole("link", { name: "Privacy Policy" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Privacy Policy" })
    ).toContainText("Privacy Policy");
  });
});
