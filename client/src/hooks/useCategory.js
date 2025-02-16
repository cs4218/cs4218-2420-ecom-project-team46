import { useState, useEffect } from "react";
import axios from "axios";

// summary
// useCategory() is a custom Hook used to fetch category data.
// When the component mounts, it automatically requests /api/v1/category/get-category.
// It stores the data in useState(), allowing multiple components to reuse it.
// It makes components like CategoryMenu cleaner, as they don’t need to handle the API logic themselves.


// custom hook. according to React, custom hooks must start with "use"
export default function useCategory() {
  // cotegories is a state variable
  const [categories, setCategories] = useState([]);

  //get cat
  const getCategories = async () => {
    try {
      // use axios to send requests to BE
      const { data } = await axios.get("/api/v1/category/get-category");
      // extract the category array
      setCategories(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  // when useEffect component is first rendered, it calls getCategories()
  useEffect(() => {
    getCategories();
  }, []);
  // [] means only run once

  return categories;
}


// Why use useCategory() instead of directly using axios.get()?

// Directly using axios.get() in the component: Complex code within the component, not reusable
// Using useCategory(): Encapsulates API calls, reusable, and cleaner code

// Any component can simply call useCategory() to fetch category data, without needing to write axios.get() in every component.

// If the API endpoint changes, only useCategory.js needs to be modified, without having to update all components.