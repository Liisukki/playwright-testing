const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    // Nollaa tietokanta
    await request.post("http://localhost:3003/api/testing/reset");

    // Uusi käyttäjä
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
    // Tarkista, että kirjautumislomakkeen elementit näkyvät
    const usernameInput = await page.getByLabel("Username:");
    const passwordInput = await page.getByLabel("Password:");
    const loginButton = await page.getByRole("button", { name: /login/i });

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  describe("Login", () => {
    // Oikeat kirjautumistiedot
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByLabel("Username:").fill("liisukki");
      await page.getByLabel("Password:").fill("salainen");

      // Koita kirjautua
      await page.getByRole("button", { name: "login" }).click();

      // Tarkista, että kirjautuminen onnistui ja käyttäjän nimi näkyy
      await expect(page.getByText("Liisa Kotilainen logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      // Väärät kirjautumistiedot
      await page.getByLabel("Username:").fill("liisukki");
      await page.getByLabel("Password:").fill("väärä");

      // Koita kirjautua
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

  test("a new blog can be created", async ({ page }) => {
    // Kirjaudu
    await page.getByLabel("Username:").fill("liisukki");
    await page.getByLabel("Password:").fill("salainen");
    await page.getByRole("button", { name: "login" }).click();

    // Varmista, että kirjautuminen onnistui
    await expect(page.getByText("Liisa Kotilainen logged in")).toBeVisible();

    // Täytä tiedot lomakkeeseen
    await page.getByRole("button", { name: "create a new blog" }).click();

    await page.getByLabel("Title:").fill("Uusi Testi blogi");
    await page.getByLabel("Author:").fill("Liisa Kotilainen");
    await page.getByLabel("Url:").fill("http://example.com");

    // Lähetä lomake
    await page.getByRole("button", { name: "create blog" }).click();

    // Varmista, että luotu blogi näkyy blogilistalla
    await expect(page.getByRole('heading', { name: "Uusi Testi blogi" })).toBeVisible();
  });
});
