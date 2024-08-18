type Props = {
  num: number;
  percentage: boolean;
};

const ChangeColors = ({ num, percentage }: Props) => {
  const textColor = num >= 0 ? "green" : "red";

  return (
    <span className={textColor}>
      {num >= 0 ? "+" : ""}
      {percentage ? "" : "$"}
      {num}
      {percentage ? "%" : ""}
    </span>
  );
};

export default ChangeColors;
