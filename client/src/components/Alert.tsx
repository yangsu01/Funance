import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  category?: "success" | "danger" | "primary";
  onClose: () => void;
}

const Alert = ({ children, category = "success", onClose }: Props) => {
  return (
    <div
      className={"alert alert-" + category + " alert-dismissible fade show"}
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
