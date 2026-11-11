import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

const FlutterwaveButton = ({ payment, customer, disabled = false, onSuccess, onFailure, onClose }) => {
  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
    tx_ref: payment?.tx_ref || "",
    amount: Number(payment?.amount || 0),
    currency: payment?.currency || "NGN",
    payment_options: payment?.paymentOptions || (payment?.currency === "USD" ? "card" : "card,banktransfer,ussd,account,opay,nqr"),
    customer: {
      email: customer?.email || "",
      name: customer?.name || "",
      phonenumber: customer?.phoneNumber || "",
    },
    customizations: {
      title: "Olu THE MAKER",
      description: "Payment for your order",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);
  const isConfigured = Boolean(config.public_key && config.tx_ref && config.amount > 0);

  const startPayment = () => {
    if (!isConfigured || disabled) return;
    handleFlutterPayment({
      callback: (response) => {
        closePaymentModal();
        if (response?.status === "successful" && (response.transaction_id || response.id)) {
          onSuccess?.(response);
        } else {
          onFailure?.(response);
        }
      },
      onClose: () => onClose?.(),
    });
  };

  return (
    <button
      type="button"
      disabled={disabled || !isConfigured}
      onClick={startPayment}
      className="w-full bg-atelier-ink text-white py-4 text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-atelier-tan transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {!config.public_key ? "Payment temporarily unavailable" : "Pay Securely with Flutterwave"}
    </button>
  );
};

export default FlutterwaveButton;
