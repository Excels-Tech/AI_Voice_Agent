import { useState } from "react";
import BillingPage from "../../billing/src/components/BillingPage";
import AddPaymentMethod from "../../billing/src/components/AddPaymentMethod";

export function Billing() {
  const [view, setView] = useState<"billing" | "add">("billing");
  const [refreshSignal, setRefreshSignal] = useState(0);

  if (view === "add") {
    return (
      <AddPaymentMethod
        onBack={() => setView("billing")}
        onAdd={() => {
          setRefreshSignal((n) => n + 1);
          setView("billing");
        }}
      />
    );
  }

  return (
    <BillingPage
      refreshSignal={refreshSignal}
      onNavigateToAddPayment={() => setView("add")}
    />
  );
}
