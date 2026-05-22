interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  action,
}: Props) => {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};