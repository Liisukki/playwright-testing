const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    // Nollaa tietokanta
    await request.post("http://localhost:3003/api/testing/reset");

    // Luo uusi käyttäjä
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "Liisukki Testaaja",
        username: "liisukki",
        password: "salainen",
      },
    });

    // Siirry sovelluksen etusivulle
    await page.goto("http://localhost:5173");
  });

  test("Login form is shown", async ({ page }) => {
    // Tarkista, että kirjautumislomakkeen elementit näkyvät
    const usernameInput = await page.getByLabel("username");
    const passwordInput = await page.getByLabel("password");
    const loginButton = await page.getByRole("button", { name: /login/i });

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });
});
