type Props = {
  title: string;
  subtitle?: string;
};

const EmptyMessage = ({ title, subtitle }: Props) => {
  return (
    <div className="my-5">
      <h2 className="text-center">{title}</h2>
      {subtitle && <h5 className="text-center">{subtitle}</h5>}
    </div>
  );
};

export default EmptyMessage;
