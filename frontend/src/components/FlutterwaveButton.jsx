import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

const FlutterwaveButton = ({
  orderId,
  amount,
  email,
  name,
  onSuccess,
  onFailure,
}) => {
  const config = {
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
    tx_ref: String(orderId),
    amount: amount,
    currency: "USD",
    payment_options: "card,mobilemoney,ussd",
    customer: { email, name },
    customizations: {
      title: "Olu THE MAKER",
      description: "Commission",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <button
      className="w-full bg-atelier-ink text-white py-4 text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-atelier-tan transition-colors"
      onClick={() => {
        handleFlutterPayment({
          callback: (response) => {
            if (response.status === "successful") {
              onSuccess(response);
            } else {
              onFailure();
            }
            closePaymentModal();
          },
          onClose: () => {},
        });
      }}
    >
      Pay Now
    </button>
  );
};

export default FlutterwaveButton;
