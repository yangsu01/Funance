import { Alert } from "react-bootstrap";

// contexts
import { useAlert, useHideAlert } from "../contexts/AlertContext";

const AlertNotification = () => {
  const { alertMessage, alertType, alertVisible } = useAlert();
  const hideAlert = useHideAlert();

  return (
    <>
      {alertVisible ? (
        <Alert variant={alertType} onClose={hideAlert} dismissible>
          {alertMessage}
        </Alert>
      ) : (
        <></>
      )}
    </>
  );
};

export default AlertNotification;
