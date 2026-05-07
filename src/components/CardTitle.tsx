type CardTitleProps = {
  title: string;
  className?: string;
};

const CardTitle = ({ title, className }: CardTitleProps) => {
  const classes = className ?? "text-[11px] font-medium uppercase tracking-wide text-white/85";
  return <span className={classes}>{title}</span>;
};

export default CardTitle;
