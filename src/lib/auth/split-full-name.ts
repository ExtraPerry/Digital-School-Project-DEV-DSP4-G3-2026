export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmedName = fullName.trim();
  const nameParts = trimmedName.split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: nameParts[0] };
  }

  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" "),
  };
}
