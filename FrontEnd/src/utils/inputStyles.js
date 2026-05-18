export function inputBorderClass(error) {
  if (error === null) {
    return "border-gray-200";
  }

  if (error === "") {
    return "border-green-400 ring-1 ring-green-300";
  }

  return "border-red-400 ring-1 ring-red-300";
}