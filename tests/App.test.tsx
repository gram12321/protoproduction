import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

describe("App", () => {
  it("runs the smallest game loop tick", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/current tick:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/money:\s*eur\s*1000/i)).toBeInTheDocument();
    expect(screen.getByText(/grain in inventory:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/building size:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/min workers:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/max staff:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/current staff:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/previous efficiency:\s*0\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/current efficiency:\s*0\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/target efficiency:\s*0\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/work required:\s*100/i)).toBeInTheDocument();
    expect(screen.getByText(/current recipe work progress:\s*0\.000/i)).toBeInTheDocument();

    const staffSlider = screen.getByRole("slider", {
      name: /hire staff for farm-1/i,
    });
    fireEvent.change(staffSlider, { target: { value: "0" } });
    expect(screen.getByText(/current staff:\s*0/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /increase size \+1/i }),
    );
    expect(screen.getByText(/building size:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/max staff:\s*4/i)).toBeInTheDocument();

    fireEvent.change(staffSlider, { target: { value: "4" } });
    expect(screen.getByText(/current staff:\s*4/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /decrease size -1/i }),
    );
    expect(screen.getByText(/building size:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/max staff:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/current staff:\s*4/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run 1 tick/i }));

    expect(screen.getByText(/current tick:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/money:\s*eur\s*1000/i)).toBeInTheDocument();
    expect(screen.getByText(/grain in inventory:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/previous efficiency:\s*0\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/current efficiency:\s*0\.56[89]/i)).toBeInTheDocument();
    expect(screen.getByText(/target efficiency:\s*0\.909/i)).toBeInTheDocument();
    expect(screen.getByText(/current recipe work progress:\s*13\.76[34]/i)).toBeInTheDocument();
  });
});
