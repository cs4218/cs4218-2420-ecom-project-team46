import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Layout from "./Layout";

jest.mock("react-helmet", () => ({
  Helmet: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock("./Header", () => () => <div data-testid="header" />);

jest.mock("./Footer", () => () => <div data-testid="footer" />);

const childContent = faker.lorem.paragraph();

const renderLayout = (attributes) => {
  if (attributes) {
    render(
      <Layout
        title={attributes.title}
        description={attributes.description}
        keywords={attributes.keywords}
        author={attributes.author}
      >
        <div data-testid="children">{childContent}</div>
      </Layout>
    );
  } else {
    render(<Layout />);
  }
};

describe("Layout", () => {
  it("should use props when props are provided", () => {
    const attributes = {
      title: faker.book.title(),
      description: faker.food.description(),
      keywords: faker.word.words(5),
      author: faker.book.author(),
    };
    renderLayout(attributes);

    expect(document.title).toBe(attributes.title);

    const descriptionMeta = document.querySelector('meta[name="description"]');
    expect(descriptionMeta).toHaveAttribute("content", attributes.description);

    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    expect(keywordsMeta).toHaveAttribute("content", attributes.keywords);

    const authorMeta = document.querySelector('meta[name="author"]');
    expect(authorMeta).toHaveAttribute("content", attributes.author);
  });

  it("should use default props when no props are provided", () => {
    renderLayout();

    expect(document.title).toBe("Ecommerce app - shop now");

    const descriptionMeta = document.querySelector('meta[name="description"]');
    expect(descriptionMeta).toHaveAttribute("content", "mern stack project");

    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    expect(keywordsMeta).toHaveAttribute("content", "mern,react,node,mongodb");

    const authorMeta = document.querySelector('meta[name="author"]');
    expect(authorMeta).toHaveAttribute("content", "Techinfoyt");
  });

  it("should render Header, Footer, Toaster and children", () => {
    const attributes = {
      title: faker.book.title(),
      description: faker.food.description(),
      keywords: faker.word.words(5),
      author: faker.book.author(),
    };
    renderLayout(attributes);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("children")).toBeInTheDocument();
    expect(screen.getByTestId("children")).toHaveTextContent(childContent);
  });
});
