import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

describe("App", () => {
  it("runs the smallest game loop tick", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/current tick:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/money:\s*eur\s*1000/i)).toBeInTheDocument();
    expect(screen.getByText(/grain in inventory:\s*0/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run 1 tick/i }));

    expect(screen.getByText(/current tick:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/money:\s*eur\s*1000/i)).toBeInTheDocument();
    expect(screen.getByText(/grain in inventory:\s*1/i)).toBeInTheDocument();
  });
});
