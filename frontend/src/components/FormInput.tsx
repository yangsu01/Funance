import React from "react";

interface Props {
  id: string;
  label: string;
  type: "text" | "email" | "password" | "number";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({ id, label, type, value, onChange }: Props) => {
  return (
    <div className="form-floating mb-3">
      <input
        id={id}
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        required
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default FormInput;
