export default function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs font-medium text-red-500">
      {message}
    </p>
  );
}