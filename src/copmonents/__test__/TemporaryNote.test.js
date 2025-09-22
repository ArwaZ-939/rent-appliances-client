import TemporaryNote from "../sections/TemporaryNote ";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

describe('TemporaryNote', () => {
  
  it('renders the title', () => {
    render(<TemporaryNote/>);
    const title = screen.getByTestId('temporary-note-title');
    expect(title).toHaveTextContent('Temporary Notes');
  });

  it('adds a note when input is provided and the "Add Note" button is clicked', () => {
    render(<TemporaryNote/>);
    const input = screen.getByTestId('note-input');
    const addButton = screen.getByTestId('add-note-button');

    fireEvent.change(input, { target: { value: 'Test Note' } });
    fireEvent.click(addButton);

    const noteItems = screen.getAllByTestId('note-item');
    expect(noteItems).toHaveLength(1); // 1 note should be added
    expect(noteItems[0]).toHaveTextContent('Test Note');
  });

  it('disables "Add Note" button when input is empty', () => {
    render(<TemporaryNote/>);
    const addButton = screen.getByTestId('add-note-button');
    expect(addButton).toBeDisabled(); // Button should be disabled initially
  });

  it('removes a note when the "Delete" button is clicked', () => {
    render(<TemporaryNote/>);
    const input = screen.getByTestId('note-input');
    const addButton = screen.getByTestId('add-note-button');

    fireEvent.change(input, { target: { value: 'Test Note' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByTestId('delete-note-button');
    fireEvent.click(deleteButton);

    const noteItems = screen.queryAllByTestId('note-item');
    expect(noteItems).toHaveLength(0); // No notes should remain
  });

});
