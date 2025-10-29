import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from '../../context/AppContext';
import DoctorProfile from '../../pages/DoctorProfile';

const MockedDoctorProfile = () => (
  <BrowserRouter>
    <AppContextProvider>
      <DoctorProfile />
    </AppContextProvider>
  </BrowserRouter>
);

describe('DoctorProfile Component', () => {
  it('should render doctor profile form', () => {
    render(<MockedDoctorProfile />);
    
    expect(screen.getByText('Doctor Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Specialization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Experience/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<MockedDoctorProfile />);
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
  });
});
