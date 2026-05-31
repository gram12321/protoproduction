import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App", () => {
  it("renders the bootstrap shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /proto production is ready for the first gameplay systems/i,
      }),
    ).toBeInTheDocument();
  });
});
