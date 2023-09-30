type JumbotronProps = {
  header: string;
  children: React.ReactNode;
};

export const Jumbotron: React.FC<JumbotronProps> = ({ header, children }) => {
  return (
    <div className="jumbotron shadow-sm">
      <h1>{header}</h1>
      <p>{children}</p>
    </div>
  );
};
