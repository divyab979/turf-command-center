interface Props {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionCard = ({
  title,
  children,
  action,
}: Props) => {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      
      {(title || action) && (
        <div className="mb-6 flex items-center justify-between">
          
          {title && (
            <h2 className="text-xl font-semibold text-foreground">
              {title}
            </h2>
          )}

          {action}
        </div>
      )}

      {children}
    </div>
  );
};