const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    // Nollaa tietokanta
    await request.post("http://localhost:5173/api/tests/reset");
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "Liisa Kotilainen",
        username: "liisukki",
        password: "salainen",
      },
    });

    // Siirry sovelluksen etusivulle
    await page.goto("http://localhost:5173");
  });

  test("Login form is shown", async ({ page }) => {
    await page.getByTestId("username").fill("liisukki");
    await page.getByTestId("password").fill("salainen");

    await page.getByRole("button", { name: "login" }).click();

    await expect(page.getByText("Liisa Kotilainen logged in")).toBeVisible();
  });

  describe("Login", () => {
    // Oikeat kirjautumistiedot
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByTestId("username").fill("liisukki");
      await page.getByTestId("password").fill("salainen");

      await page.getByRole("button", { name: "login" }).click();

      await expect(page.getByText("Liisa Kotilainen logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      // Väärät kirjautumistiedot
      await page.getByTestId("username").fill("liisukki");
      await page.getByTestId("password").fill("väärä");

      await page.getByRole("button", { name: "login" }).click();

      // Tarkista, että ilmoitus epäonnistuneesta kirjautumisesta näkyy
      const errorNotification = await page.getByText(
        "Wrong username or password"
      );
      await expect(errorNotification).toBeVisible();

      // Varmista, että käyttäjä ei ole kirjautunut sisään
      await expect(page.getByText("Liisa Kotilainen logged in")).toHaveCount(0);
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId("username").fill("liisukki");
      await page.getByTestId("password").fill("salainen");
      await page.getByRole("button", { name: "login" }).click();
    });

    test("a new blog can be created", async ({ page }) => {
      // Klikkaa "Create a new blog" -painiketta
      await page.getByRole("button", { name: "create a new blog" }).click();

      // Täytä blogin tiedot lomakkeelle
      await page.getByTestId("title").fill("X Testi blogi");
      await page.getByTestId("author").fill("Liisa Kotilainen");
      await page.getByTestId("url").fill("http://example.com");

      // Lähetä lomake
      await page.getByRole("button", { name: "Save" }).click();

      // Varmista, että uusi blogi näkyy listassa
      await expect(page.getByText("X Testi blogi").nth(0)).toBeVisible();
    });
  });
});
