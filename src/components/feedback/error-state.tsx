type Props = {
  message?: string;
};

export function ErrorState({
  message = "Something went wrong",
}: Props) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <p className="text-sm font-medium text-red-600">
        {message}
      </p>
    </div>
  );
}