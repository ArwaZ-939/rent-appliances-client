import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mocks for non-JS imports and layout components
jest.mock("../pages/../css/Contact.css", () => ({}));
jest.mock("../pages/../assets/rental.avif", () => "rental.jpg");
jest.mock("../pages/../sections/Footer", () => () => <div data-testid="footer">Footer</div>);
jest.mock("../pages/../sections/Header", () => () => <div data-testid="header">Header</div>);

// Router mocks
const mockedNavigate = jest.fn();
let mockedLocationState = undefined;
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({ state: mockedLocationState }),
  };
});

// Import component and context after mocks
import RentalBooking from "../pages/RentalBooking";
import { DarkModeContext } from "../pages/../sections/DarkModeContext";

const renderWithProviders = (ui) => {
  return render(
    <DarkModeContext.Provider value={{ darkMode: false }}>
      {ui}
    </DarkModeContext.Provider>
  );
};

describe("RentalBooking", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    mockedLocationState = undefined;
  });

  it("renders the title and layout", () => {
    renderWithProviders(<RentalBooking />);
    expect(screen.getByText(/Rental booking/i)).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("shows appliance info and initial amounts from location state", () => {
    mockedLocationState = {
      price: 10,
      appliance: { name: "Vacuum Pro", details: "High suction" },
    };
    renderWithProviders(<RentalBooking />);

    expect(screen.getByText(/Renting: Vacuum Pro/)).toBeInTheDocument();
    expect(screen.getByText(/High suction/)).toBeInTheDocument();
    expect(screen.getByText(/Rental Amount: 10 OMR/)).toBeInTheDocument();
    expect(screen.getByText(/Insurance Deposit: 20 OMR/)).toBeInTheDocument();
    expect(screen.getByText(/Final Amount: 30 OMR/)).toBeInTheDocument();
  });

  it("updates totals when days input changes", () => {
    mockedLocationState = { price: 7, appliance: { name: "Fan", details: "" } };
    renderWithProviders(<RentalBooking />);

    const daysInput = screen.getByLabelText(/Days/i);
    fireEvent.change(daysInput, { target: { value: "3" } });

    expect(screen.getByText(/Rental Amount: 21 OMR/)).toBeInTheDocument();
    expect(screen.getByText(/Final Amount: 41 OMR/)).toBeInTheDocument();
  });

  it("requires agreeing to terms before enabling submit", () => {
    renderWithProviders(<RentalBooking />);
    const submitBtn = screen.getByRole("button", { name: /PROCEED TO PAYMENT/i });
    expect(submitBtn).toBeDisabled();

    const checkbox = screen.getByLabelText(/I agree to the terms/i);
    fireEvent.click(checkbox);
    expect(submitBtn).toBeEnabled();
  });

  it("navigates to payment with correct state on submit", () => {
    mockedLocationState = {
      price: 15,
      appliance: { name: "Washer", details: "Front-load" },
    };
    renderWithProviders(<RentalBooking />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Days/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/Place/i), { target: { value: "Muscat" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "12345678" } });
    fireEvent.click(screen.getByLabelText(/I agree to the terms/i));

    fireEvent.click(screen.getByRole("button", { name: /PROCEED TO PAYMENT/i }));

    expect(mockedNavigate).toHaveBeenCalledWith("/payment", {
      state: {
        totalAmount: 30, // 2 days * 15
        finalAmount: 50, // + 20 deposit
        appliance: { name: "Washer", details: "Front-load" },
        days: 2,
      },
    });
  });
});

