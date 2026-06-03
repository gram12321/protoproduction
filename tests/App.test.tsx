import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

describe("App", () => {
  it("blocks recipe start without required input and warns in UI", async () => {
    const user = userEvent.setup();

    render(<App />);

    fireEvent.change(screen.getByLabelText(/building city/i), {
      target: { value: "copenhagen" },
    });
    fireEvent.change(screen.getByLabelText(/building type/i), {
      target: { value: "bakery" },
    });
    await user.click(screen.getByRole("button", { name: /build building/i }));

    expect(
      screen.getByText(/cannot start production:\s*need 1 flour/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/bread in inventory:\s*0/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run 1 tick/i }));

    expect(screen.getByText(/bread in inventory:\s*0/i)).toBeInTheDocument();
    expect(
      screen.getByText(/cannot start production:\s*need 1 flour/i),
    ).toBeInTheDocument();
  });

  it("runs the smallest game loop tick", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.getByRole("heading", { name: /city marketplace/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/base cost/i)).toBeInTheDocument();
    expect(screen.getByText(/base city price/i)).toBeInTheDocument();
    expect(screen.getByText(/base city demand/i)).toBeInTheDocument();
    expect(screen.getByText(/population:\s*66/i)).toBeInTheDocument();
    expect(screen.getByText(/wealth:\s*0,93/i)).toBeInTheDocument();
    expect(screen.getByText(/^20$/i)).toBeInTheDocument();
    expect(screen.getByText(/^38,6$/i)).toBeInTheDocument();
    expect(screen.getByText(/^6,14$/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/marketplace city/i), {
      target: { value: "aarhus" },
    });

    expect(screen.getByText(/population:\s*29/i)).toBeInTheDocument();
    expect(screen.getByText(/wealth:\s*0,91/i)).toBeInTheDocument();
    expect(screen.getByText(/^38,2$/i)).toBeInTheDocument();
    expect(screen.getByText(/^1,32$/i)).toBeInTheDocument();

    expect(screen.getByText(/current tick:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/money:\s*€\s*1,000/i)).toBeInTheDocument();
    expect(screen.getByText(/grain in inventory:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/flour in inventory:\s*0/i)).toBeInTheDocument();
    expect(screen.getByText(/buildings count:\s*0/i)).toBeInTheDocument();

    const buildButton = screen.getByRole("button", { name: /build building/i });
    expect(buildButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/building city/i), {
      target: { value: "copenhagen" },
    });

    expect(buildButton).toBeEnabled();
    await user.click(buildButton);

    expect(screen.getByText(/buildings count:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/farm \(farm-1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/city:\s*copenhagen/i)).toBeInTheDocument();
    expect(screen.getAllByText(/nation:\s*denmark/i)).toHaveLength(2);
    expect(screen.getByText(/recipe:\s*grow grain/i)).toBeInTheDocument();
    expect(screen.getByText(/min workers:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/max staff:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/current staff:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/previous efficiency:\s*0,000/i)).toBeInTheDocument();
    expect(screen.getByText(/current efficiency:\s*0,000/i)).toBeInTheDocument();
    expect(screen.getByText(/target efficiency:\s*0,000/i)).toBeInTheDocument();
    expect(screen.getByText(/work required:\s*100/i)).toBeInTheDocument();
    expect(screen.getByText(/current recipe work progress:\s*0,000/i)).toBeInTheDocument();

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
    expect(screen.getByText(/money:\s*€\s*1,000/i)).toBeInTheDocument();
    expect(screen.getByText(/grain in inventory:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/previous efficiency:\s*0,000/i)).toBeInTheDocument();
    expect(screen.getByText(/current efficiency:\s*0,854/i)).toBeInTheDocument();
    expect(screen.getByText(/target efficiency:\s*1,139/i)).toBeInTheDocument();
    expect(screen.getByText(/current recipe work progress:\s*70,79[34]/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/building type/i), {
      target: { value: "foodprocessingfactory" },
    });
    await user.click(screen.getByRole("button", { name: /build building/i }));
    expect(screen.getByText(/buildings count:\s*2/i)).toBeInTheDocument();
    expect(
      screen.getByText(/foodprocessingfactory \(foodprocessingfactory-1\)/i),
    ).toBeInTheDocument();

    for (let tick = 0; tick < 10; tick += 1) {
      await user.click(screen.getByRole("button", { name: /run 1 tick/i }));
    }

    expect(screen.getByText(/flour in inventory:\s*[1-9]/i)).toBeInTheDocument();
  });

  it("sells listed stock against local suppliers on tick", async () => {
    const user = userEvent.setup();

    render(<App />);

    fireEvent.change(screen.getByLabelText(/building city/i), {
      target: { value: "copenhagen" },
    });
    await user.click(screen.getByRole("button", { name: /build building/i }));
    await user.click(screen.getByRole("button", { name: /run 1 tick/i }));

    fireEvent.change(screen.getByLabelText(/sell quantity for grain/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/offer price for grain/i), {
      target: { value: "38.6" },
    });

    await user.click(screen.getByRole("button", { name: /run 1 tick/i }));

    expect(screen.getByText(/money:\s*€1,000/i)).toBeInTheDocument();
    expect(screen.getByText(/previous tick offer results/i)).toBeInTheDocument();
    expect(screen.getAllByText(/local suppliers/i)).toHaveLength(2);
    expect(screen.getByRole("cell", { name: /player/i })).toBeInTheDocument();
    expect(screen.getByText(/infinity/i)).toBeInTheDocument();
  });

  it("supports bakery recipes and cake requirements", async () => {
    const user = userEvent.setup();

    render(<App />);

    fireEvent.change(screen.getByLabelText(/building city/i), {
      target: { value: "copenhagen" },
    });
    await user.click(screen.getByRole("button", { name: /build building/i }));

    fireEvent.change(screen.getByLabelText(/building type/i), {
      target: { value: "foodprocessingfactory" },
    });
    await user.click(screen.getByRole("button", { name: /build building/i }));

    fireEvent.change(screen.getByLabelText(/building type/i), {
      target: { value: "bakery" },
    });
    await user.click(screen.getByRole("button", { name: /build building/i }));

    expect(screen.getByText(/bakery \(bakery-1\)/i)).toBeInTheDocument();

    for (let tick = 0; tick < 12; tick += 1) {
      await user.click(screen.getByRole("button", { name: /run 1 tick/i }));
    }

    expect(screen.getByText(/bread in inventory:\s*[1-9]/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/recipe for farm-1/i), {
      target: { value: "grow-sugarcain" },
    });
    fireEvent.change(
      screen.getByLabelText(/recipe for foodprocessingfactory-1/i),
      {
        target: { value: "process-sugarcain" },
      },
    );
    fireEvent.change(screen.getByLabelText(/recipe for bakery-1/i), {
      target: { value: "bake-cake" },
    });

    expect(
      screen.getByText(/cannot start production:\s*need 2 flour, 1 sugar/i),
    ).toBeInTheDocument();

    for (let tick = 0; tick < 30; tick += 1) {
      await user.click(screen.getByRole("button", { name: /run 1 tick/i }));
    }

    expect(screen.getByText(/sugar in inventory:\s*[1-9]/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/recipe for farm-1/i), {
      target: { value: "produce-grain" },
    });

    fireEvent.change(
      screen.getByLabelText(/recipe for foodprocessingfactory-1/i),
      {
        target: { value: "produce-flour" },
      },
    );

    for (let tick = 0; tick < 12; tick += 1) {
      await user.click(screen.getByRole("button", { name: /run 1 tick/i }));
    }

    expect(screen.getByText(/cake in inventory:\s*[1-9]/i)).toBeInTheDocument();
  });
});
