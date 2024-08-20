import React from "react";

import { Form, FloatingLabel } from "react-bootstrap";

type Props = {
  inputLabel?: string;
  label: string;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  required?: boolean;
  step?: string;
};

const FormFloatingLabel = ({
  inputLabel,
  label,
  id,
  onChange,
  type,
  required = true,
  step,
}: Props) => {
  return (
    <>
      {inputLabel && <Form.Label className="mb-3">{inputLabel}</Form.Label>}
      <FloatingLabel controlId={id} label={label} className="mb-3">
        <Form.Control
          required={required}
          type={type}
          placeholder={label}
          onChange={onChange}
          step={step}
        />
      </FloatingLabel>
    </>
  );
};

export default FormFloatingLabel;
