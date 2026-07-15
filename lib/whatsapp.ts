// wa.me only supports prefilled text for 1:1 chats — group chats can't be
// prefilled, so group notifications use copy-to-clipboard instead.
export function waLink(phone: string, text: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
