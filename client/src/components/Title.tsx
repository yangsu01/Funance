interface Props {
  title: string;
  subTitle: string;
}

const Title = ({ title, subTitle }: Props) => {
  return (
    <div className="border-bottom mb-4">
      <h1 className="display-5 fw-bold text-white">{title}</h1>
      <h5>{subTitle}</h5>
    </div>
  );
};

export default Title;
