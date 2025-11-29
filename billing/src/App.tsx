import { useState } from 'react';
import BillingPage from './components/BillingPage';
import AddPaymentMethod from './components/AddPaymentMethod';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'billing' | 'add-payment'>('billing');

  const handleAddPaymentMethod = (method: any) => {
    console.log('Payment method added:', method);
    toast.success('Payment method added successfully!');
    setCurrentPage('billing');
  };

  return (
    <>
      {currentPage === 'billing' ? (
        <BillingPage onNavigateToAddPayment={() => setCurrentPage('add-payment')} />
      ) : (
        <AddPaymentMethod 
          onBack={() => setCurrentPage('billing')}
          onAdd={handleAddPaymentMethod}
        />
      )}
      <Toaster />
    </>
  );
}
