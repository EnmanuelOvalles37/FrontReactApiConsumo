
export function validateEmail(email: string): boolean {
  // formato general: texto@texto.dominio
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  // acepta formato dominicano: 809-555-1234 o 8095551234
  const re = /^(809|829|849)[- ]?\d{3}[- ]?\d{4}$/;
  return re.test(phone.trim());
}

export function maskAndValidateRNC(input: string): { value: string; valid: boolean } {
  const digits = input.replace(/\D/g, "").slice(0, 9);
  let value = digits;

  if (digits.length > 3 && digits.length <= 8) {
    value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else if (digits.length > 8) {
    value = `${digits.slice(0, 3)}-${digits.slice(3, 8)}-${digits.slice(8)}`;
  }

  const valid = digits.length === 9;
  return { value, valid };
}
