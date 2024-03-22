import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  category: string;
  onClose: () => void;
}

const Alert = ({ children, category, onClose }: Props) => {
  let alertClass = "";

  switch (category) {
    case "success":
      alertClass = "success";
      break;
    case "danger":
      alertClass = "danger";
      break;
    default:
      alertClass = "primary";
      break;
  }

  return (
    <div
      className={"alert alert-" + alertClass + " alert-dismissible fade show"}
      role="alert"
    >
      {children}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
        onClick={onClose}
      ></button>
    </div>
  );
};

export default Alert;
