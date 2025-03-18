import categoryModel from "../models/categoryModel";
import { describe } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import slugify from "slugify";

import {
		createCategoryController,
		updateCategoryController,
		categoryControlller,
		singleCategoryController,
		deleteCategoryController,
	} from "./categoryController";

// in-memory mongo server for testing
let mongoServer;

const res = {
		status: jest.fn().mockReturnThis(),
		send: jest.fn(),
		json: jest.fn(),
	};

// mock objects 
const categories = [
		{
			name: "cat0",
			slug: "cat0",
		},
		{
			name: "cat1",
			slug: "cat1",
		},
		{
			name: "cat2",
			slug: "cat2",
		},
		{
			name: "cat3",
			slug: "cat3",
		},
	];

beforeAll(async () => {
  // set up in-memory mongo database for all tests in this file
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// after tests are done, cleanup/teardown in-memory mongo database
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// clear mocks and remove all documents in product/category db collection before each test
beforeEach(async () => {
  jest.clearAllMocks();
  await categoryModel.deleteMany({});
});

it("should check that name is required for category creation", async () => {

	const req = { body: { name: "" } };

	await createCategoryController(req, res);

	expect(res.status).toHaveBeenCalledWith(401);
	expect(res.send).toHaveBeenCalledWith(
			{ success: false, message: "Name is required" }
	);
});

describe("createCategoryController tests", () => {

	it("should check that name is required for category creation", async () => {

		const req = { body: { name: "" } };

		await createCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith(
				{ success: false, message: "Name is required" }
		);
	});

	it("should check that category already existed", async () => {

		await categoryModel.insertMany(categories);

		const req = { body: { name: categories[0].name } };

		await createCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
				{
					success: true,
					message: "Category already exist",
				}
		);
	});

	it("should be successful in creating new category", async () => {

		const req = { body: { name: categories[0].name } };

		await createCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: "New category created",
					category: expect.objectContaining({
						name: categories[0].name,
					}),
				})
			);
	});

	it("should handle error and return 500 response", async () => {

		const error = new Error("createCategoryController Error");
		jest.spyOn(categoryModel, "findOne").mockRejectedValueOnce(error);

		const req = { body: { name: categories[0].name } };

		await createCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenLastCalledWith({
				success: false,
				message: "Error in category creation",
				error: error,
			});
		
		// restore categoryModel.findOne from mock functionality
		categoryModel.findOne.mockRestore();
	});
});

describe("updateCategoryController tests", () => {
	
	it("should be successful in category update", async () => {

		await categoryModel.insertMany(categories);

		const categoryUpdate = await categoryModel.findOne({});
		const updatedName = categoryUpdate.name + ' updated';

		const req = { body: { name: updatedName }, params: { id: categoryUpdate._id.toString() } };

		await updateCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
					expect.objectContaining({
						success: true,
						message: "Category updated successfully",
						category: expect.objectContaining({
							_id: expect.anything(),
							name: updatedName,
							slug: slugify(updatedName)
					}),
				})
			);

		// Explicitly compare _id values as strings
		const jsonResponse = res.send.mock.calls[0][0];
		expect(jsonResponse.category._id.toString()).toBe(categoryUpdate._id.toString());
	});

	it("should not allow name to be updated to empty string", async () => {

		await categoryModel.insertMany(categories);

		const categoryUpdate = await categoryModel.findOne({});
		const updatedName = "";

		const req = { body: { name: updatedName }, params: { id: categoryUpdate._id.toString() } };

		await updateCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith(
			{ success: false, message: "Name is required" }
		);
	});

	it("should be successful in category update", async () => {

		await categoryModel.insertMany(categories);

		const categoryUpdate = await categoryModel.findOne({});
		const updatedName = categoryUpdate.name + ' updated';

		const req = { body: { name: updatedName }, params: { id: categoryUpdate._id.toString() } };

		await updateCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
					expect.objectContaining({
						success: true,
						message: "Category updated successfully",
						category: expect.objectContaining({
							name: updatedName,
							slug: slugify(updatedName)
					}),
				})
			);

		// Explicitly compare _id values as strings
		const jsonResponse = res.send.mock.calls[0][0];
		expect(jsonResponse.category._id.toString()).toBe(categoryUpdate._id.toString());
		
	});

	it("should handle error and return 500 response", async () => {

		await categoryModel.insertMany(categories);

		const categoryUpdate = await categoryModel.findOne({});
		const updatedName = categoryUpdate.name + ' updated';
		
		const error = new Error("updateCategoryController Error");
		jest.spyOn(categoryModel, "findByIdAndUpdate").mockRejectedValueOnce(error);

		const req = { body: { name: updatedName }, params: { id: categoryUpdate._id.toString() }};

		await updateCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenLastCalledWith({
				success: false,
				message: "Error while updating category",
				error: error,
			});
		
		// restore categoryModel.findByIdAndUpdate from mock functionality
		categoryModel.findByIdAndUpdate.mockRestore();
	});
});

describe("categoryControlller tests", () => {
	
	it("should be successful in getting all categories", async () => {

		await categoryModel.insertMany(categories);

		await categoryControlller({}, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
					expect.objectContaining({
						success: true,
						message: "All categories list",
					})
		);

		const lastCall = res.send.mock.lastCall[0];
		for (let i = 0; i < lastCall.category.length; i++) {
			const currCategory = categories[i];
			expect(currCategory).toMatchObject(
				expect.objectContaining({
			name: lastCall.category[i].name,
			slug: lastCall.category[i].slug,
				})
	  );
		};

		expect(lastCall.category.length).toBe(categories.length);
	});

	it("should handle error and return 500 response", async () => {

		await categoryModel.insertMany(categories);

		const error = new Error("categoryControlller Error");
		jest.spyOn(categoryModel, "find").mockRejectedValueOnce(error);

		await categoryControlller({}, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenLastCalledWith({
				success: false,
				message: "Error while getting all categories",
				error: error,
			});
		
		// restore categoryModel.find from mock functionality
		categoryModel.find.mockRestore();
	});	
});

describe("singleCategoryController tests", () => {
	
	it("should be successful in getting a single category", async () => {

		await categoryModel.insertOne(categories[0]);

		const slug = categories[0].slug;

		const req = { params: { slug } };

		await singleCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
					expect.objectContaining({
						success: true,
						message: "Get single category successfully",
					})
		);

		const lastCall = res.send.mock.lastCall[0];

		expect(categories[0]).toMatchObject(
			expect.objectContaining({
				name: lastCall.category.name,
				slug: lastCall.category.slug,
			})
		);
	});

	it("should be successful even if there are no results", async () => {

		const slug = categories[0].slug;
		const req = { params: { slug } };

		await singleCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
					expect.objectContaining({
						success: true,
						message: "Get single category successfully",
					})
		);

		const lastCall = res.send.mock.lastCall[0];
		expect(lastCall.category).toBeNull();
	});

	it("should handle error and return 500 response", async () => {

		await categoryModel.insertMany(categories);
		const slug = categories[0].slug;
		const req = { params: { slug } };

		const error = new Error("singleCategoryController Error");
		jest.spyOn(categoryModel, "findOne").mockRejectedValueOnce(error);

		await singleCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenLastCalledWith({
				success: false,
				message: "Error while getting single category",
				error: error,
			});
		
		// restore categoryModel.findOne from mock functionality
		categoryModel.findOne.mockRestore();
	});	
});

describe("deleteCategoryController tests", () => {
	
	it("should be successful in deleting a category", async () => {

		await categoryModel.insertMany(categories);

		const categoryDelete = await categoryModel.findOne({});
		const deleteId = categoryDelete._id;
		const req = { params: { id: deleteId} };

		await deleteCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
					{
						success: true,
						message: "Category deleted successfully",
					}
		);

		const deletedCategory = await categoryModel.findById(deleteId);
		expect(deletedCategory).toBeNull();
	
		const remainingCategories = await categoryModel.find({});
		expect(remainingCategories.length).toBe(categories.length - 1);
	});

	it("should handle error and return 500 response", async () => {

		await categoryModel.insertMany(categories);

		const categoryDelete = await categoryModel.findOne({});

		const req = { params: { id: categoryDelete._id } };

		const error = new Error("deleteCategoryController Error");
		jest.spyOn(categoryModel, "findByIdAndDelete").mockRejectedValueOnce(error);

		await deleteCategoryController(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenLastCalledWith({
				success: false,
				message: "Error while deleting category",
				error: error,
			});
		
		// restore categoryModel.findByIdAndDelete from mock functionality
		categoryModel.findByIdAndDelete.mockRestore();
	});	
});