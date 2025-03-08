import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory() {
  const [categories, setCategories] = useState([]);

  //get cat
  const getCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      // Only update the categories state if the API response indicates success.
      // This prevents updating the state with invalid data when the API call fails.
      if (data.success) {
        setCategories(data.category);
      } else {
        // If the API call is unsuccessful, set categories to an empty array.
        setCategories([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return categories;
}