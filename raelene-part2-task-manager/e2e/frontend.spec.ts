import "./playwright-coverage.js";
import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:5050";

async function waitForTaskSections(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("#pending-tasks").waitFor({ state: "visible", timeout: 8000 });
  await page.locator("#completed-tasks").waitFor({ state: "visible", timeout: 8000 });
}
// Helper to set logged-in email in localStorage before page load
function setLoggedInEmail(page: Page, email = "test@student.tp.edu.sg") {
  return page.addInitScript((e) => localStorage.setItem("email", e), email);
}
// Tests for frontend/view-tasks.html
test.describe("Frontend – View Tasks (Raelene)", () => {
  test("success: loads page with Pending and Completed sections", async ({ page }) => {
    await setLoggedInEmail(page);

    // Return empty list so it hits displayTasks([]) and empty-state messages
    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Check that both sections are visible with empty-state text
    await expect(page.locator("#pending-tasks")).toBeVisible();
    await expect(page.locator("#completed-tasks")).toBeVisible();
    await expect(page.locator("#pending-tasks")).toContainText(/no pending tasks/i);
    await expect(page.locator("#completed-tasks")).toContainText(/no completed tasks/i);
  });
  // Comprehensive test combining filtering, sorting, and status display
  test("success: displays pending + completed tasks, sorts by dueDate, and filters by createdBy", async ({ page }) => {
    await setLoggedInEmail(page, "test@student.tp.edu.sg");

    // Includes:
    // - 2 tasks for logged-in user (1 pending, 1 completed)
    // - 1 task for a different user (must be filtered out)
    // - due dates arranged to test sorting (earlier date should appear first)
    const apiTasks = [
      {
        id: 11,
        title: "Other User Task",
        dueDate: "2026-01-01",
        status: "pending",
        createdBy: "someoneelse@student.tp.edu.sg",
      },
      {
        id: 12,
        title: "Pending Task A",
        dueDate: "2026-01-10",
        status: "pending",
        createdBy: "test@student.tp.edu.sg",
      },
      {
        id: 13,
        title: "Completed Task B",
        dueDate: "2026-01-09",
        status: "completed",
        createdBy: "test@student.tp.edu.sg",
      },
    ];
    // Verify that only tasks for logged-in user appear, in correct sections
    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiTasks),
      });
    });

    await page.goto(BASE_URL);
    await waitForTaskSections(page);

    // Filtered out task must not appear
    await expect(page.locator("#pending-tasks")).not.toContainText("Other User Task");

    // Visible tasks
    await expect(page.locator("#pending-tasks")).toContainText("Pending Task A");
    await expect(page.locator("#completed-tasks")).toContainText("Completed Task B");

    // Sorting check (your code sorts by dueDate earliest first within the combined list,
    // then appends into pending/completed — so we’ll just ensure the due-date text renders)
    await expect(page.locator("#pending-tasks")).toContainText(/Due Date:/i);
    await expect(page.locator("#completed-tasks")).toContainText(/Due Date:/i);
  });

  // test to specifically verify dueDate sorting logic
  test("success: sorts tasks by earliest dueDate first within pending", async ({ page }) => {
    await setLoggedInEmail(page, "test@student.tp.edu.sg");
    // Two pending tasks with different dueDates
    const apiTasks = [
      {
        id: 31,
        title: "Later Task",
        dueDate: "2026-01-10",
        status: "pending",
        createdBy: "test@student.tp.edu.sg",
      },
      {
        id: 32,
        title: "Earlier Task",
        dueDate: "2026-01-05",
        status: "pending",
        createdBy: "test@student.tp.edu.sg",
      },
    ];
    // Verify that Earlier Task appears before Later Task in the DOM
    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiTasks),
      });
    });

    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Check order of pending tasks
    const pendingItems = page.locator("#pending-tasks .task-item p");
    await expect(pendingItems).toHaveCount(2);

    // DOM order should be: Earlier Task first, then Later Task
    await expect(pendingItems.nth(0)).toHaveText("Earlier Task");
    await expect(pendingItems.nth(1)).toHaveText("Later Task");
  });

  // EDGE case - tests for formatDate function
  test("edge: formatDate returns 'No due date' when dueDate is missing", async ({ page }) => {
    // Set up logged-in user
    await setLoggedInEmail(page);
    // Task with empty dueDate to trigger "No due date"
    const apiTasks = [
      {
        id: 21,
        title: "No Date Task",
        dueDate: "", // triggers formatDate: !dateStr -> "No due date"
        status: "pending",
        createdBy: "test@student.tp.edu.sg",
      },
    ];
    // Verify that "No due date" is displayed
    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiTasks),
      });
    });
    // load application
    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Verify that "No due date" is displayed
    await expect(page.locator("#pending-tasks")).toContainText("No Date Task");
    await expect(page.locator("#pending-tasks")).toContainText(/No due date/i);
  });

  // EDGE case for invalid date format
  test("edge: formatDate returns 'Invalid date' when dueDate is not a date", async ({ page }) => {
    await setLoggedInEmail(page);

    const apiTasks = [
      {
        id: 22,
        title: "Bad Date Task",
        dueDate: "not-a-date", // triggers formatDate invalid date
        status: "pending",
        createdBy: "test@student.tp.edu.sg",
      },
    ];

    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiTasks),
      });
    });

    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Verify that "Invalid date" is displayed
    await expect(page.locator("#pending-tasks")).toContainText("Bad Date Task");
    await expect(page.locator("#pending-tasks")).toContainText(/Invalid date/i);
  });
  // Error handling tests
  test("error: shows corruption message when backend returns 400", async ({ page }) => {
    await setLoggedInEmail(page);

    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "corrupted" }),
      });
    });

    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Verify that data corruption message is displayed
    await expect(page.locator("#pending-tasks")).toContainText(/data corruption/i);
  });
  // Test for server error handling
  test("error: shows server error message when backend returns 500", async ({ page }) => {
    await setLoggedInEmail(page);

    await page.route("**/view-tasks", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "server error" }),
      });
    });

    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Verify that server error message is displayed
    await expect(page.locator("#pending-tasks")).toContainText(/server error/i);
  });
  // Test for network failure handling
  test("error: shows unexpected error message when network fails", async ({ page }) => {
    await setLoggedInEmail(page);

    await page.route("**/view-tasks", async (route) => {
      await route.abort(); // triggers catch(error)
    });
    // Verify that unexpected error message is displayed
    await page.goto(BASE_URL);
    await waitForTaskSections(page);
    // Verify that unexpected error message is displayed
    await expect(page.locator("#pending-tasks")).toContainText(/unexpected error/i);
  });
  // Test for redirect when not logged in
  test("error: redirects to register when user is not logged in", async ({ page }) => {
    // No localStorage email set here
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/register\.html/i);
  });
});
