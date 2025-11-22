import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock non-JS imports and layout components used by Payment
jest.mock("../pages/../css/Payment.css", () => ({}));
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

import Payment from "../pages/Payment";

describe("Payment", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    mockedLocationState = undefined;
    jest.useRealTimers();
  });

  beforeAll(() => {
    if (typeof window.IntersectionObserver === 'undefined') {
      class MockIntersectionObserver {
        constructor() {}
        observe() {}
        disconnect() {}
        unobserve() {}
        takeRecords() { return []; }
      }
      // @ts-ignore
      window.IntersectionObserver = MockIntersectionObserver;
      // @ts-ignore
      global.IntersectionObserver = MockIntersectionObserver;
    }
  });

  it("renders order summary and pay button with correct amount", () => {
    mockedLocationState = {
      totalAmount: 30,
      finalAmount: 50,
      appliance: { name: "Washer", details: "Front-load" },
      days: 2,
    };

    render(<Payment />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
    // Text may be split across elements (label in <strong>, value as text)
    expect(screen.getByText(/Washer/)).toBeInTheDocument();
    // Duration text is split across nodes; match by normalized textContent
    const durationMatches = screen.getAllByText((content, node) => {
      const text = node?.textContent?.replace(/\s+/g, ' ').trim() || '';
      return text.includes('Rental Duration:') && text.includes('2') && text.includes('week(s)');
    });
    expect(durationMatches.length).toBeGreaterThan(0);
    const rentalAmountMatches = screen.getAllByText((content, node) => {
      const text = node?.textContent?.replace(/\s+/g, ' ').trim() || '';
      return text.includes('Rental Amount:') && text.includes('30') && text.includes('OMR');
    });
    expect(rentalAmountMatches.length).toBeGreaterThan(0);

    const insuranceMatches = screen.getAllByText((content, node) => {
      const text = node?.textContent?.replace(/\s+/g, ' ').trim() || '';
      return text.includes('Insurance Deposit:') && text.includes('20') && text.includes('OMR');
    });
    expect(insuranceMatches.length).toBeGreaterThan(0);

    const finalAmountMatches = screen.getAllByText((content, node) => {
      const text = node?.textContent?.replace(/\s+/g, ' ').trim() || '';
      return text.includes('Final Amount:') && text.includes('50') && text.includes('OMR');
    });
    expect(finalAmountMatches.length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /PAY 50 OMR/i })).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("calculates and displays end date after selecting start date", () => {
    // Freeze time for stable date formatting and min/max attributes
    jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00Z"));

    mockedLocationState = {
      totalAmount: 10,
      appliance: { name: "Fan", details: "" },
      days: 1, // 1 week
    };

    render(<Payment />);

    const startDateInput = screen.getByLabelText(/Rental Start Date/i);
    // Select today's date per mocked time
    fireEvent.change(startDateInput, { target: { value: "2025-01-01" } });

    const expectedEndDate = new Date("2025-01-08T00:00:00Z");
    const expectedEndDateText = expectedEndDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    expect(
      screen.getByText(new RegExp(`Your rental will end on: .*${expectedEndDateText}`))
    ).toBeInTheDocument();
  });

  it("submits and navigates to delivery with correct state", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00Z"));

    mockedLocationState = {
      totalAmount: 30,
      appliance: { name: "Washer", details: "Front-load" },
      days: 2,
    };

    render(<Payment />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Rental Start Date/i), { target: { value: "2025-01-01" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: "credit" } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: "4111111111111111" } });
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { target: { value: "1226" } });
    fireEvent.change(screen.getByLabelText(/^CVV/), { target: { value: "123" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /PAY/i }));
      // Advance fake timers to resolve the 2s simulated processing
      jest.runAllTimers();
    });

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    const navArgs = mockedNavigate.mock.calls[0];
    expect(navArgs[0]).toBe("/delivery");
    expect(navArgs[1]).toEqual({
      state: expect.objectContaining({
        totalAmount: 30,
        finalAmount: 50, // 30 + 20 deposit inferred in component
        appliance: { name: "Washer", details: "Front-load" },
        days: 2,
        email: "user@example.com",
        paymentMethod: "credit",
        cardNumber: "4111 1111 1111 1111",
        expiryDate: "12/26",
        cvv: "123",
        rentalPeriod: expect.objectContaining({
          start: "2025-01-01",
          end: "2025-01-15", // 2 weeks from start (days * 7)
        }),
      }),
    });
  });
});


