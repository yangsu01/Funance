import React, { useState, useEffect, createContext, useContext } from "react";

type Props = {
  children: React.ReactNode;
};

type AlertType = "success" | "danger" | "warning";

const AlertContext = createContext({
  alertMessage: "",
  alertType: "success" as AlertType,
  alertVisible: false,
});
const AlertShowContext = createContext<
  (message: string, type: AlertType) => void
>(() => {});
const AlertHideContext = createContext(() => {});

export function useAlert() {
  return useContext(AlertContext);
}

export function useShowAlert() {
  return useContext(AlertShowContext);
}

export function useHideAlert() {
  return useContext(AlertHideContext);
}

export function AlertProvider({ children }: Props) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("success");

  const showAlert = (alertMessage: string, alertType: AlertType) => {
    setAlertMessage(alertMessage);
    setAlertType(alertType);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  // auto close alert after 5 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <AlertContext.Provider value={{ alertMessage, alertType, alertVisible }}>
      <AlertShowContext.Provider value={showAlert}>
        <AlertHideContext.Provider value={hideAlert}>
          {children}
        </AlertHideContext.Provider>
      </AlertShowContext.Provider>
    </AlertContext.Provider>
  );
}
