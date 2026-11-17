export type FaqReply = { content: string; links: { label: string; to: string }[] };

export const faqSuggestions = ["Delivery options", "Returns", "Track my order", "Find products", "Talk to the team"];

// All replies are predefined and run locally. No AI provider or network call is used.
export function getFaqReply(message: string): FaqReply {
  const text = message.toLowerCase().replace(/[’']/g, "");
  const matches = (pattern: RegExp) => pattern.test(text);
  if (matches(/\b(return\w*|refund\w*|exchange\w*)\b/)) return {
    content: "Unused, unopened items can be returned within 30 days of delivery. Contact our beauty team to start a return or ask about refunds and exchanges.",
    links: [{ label: "Shipping & returns", to: "/shipping-returns" }, { label: "Start a return", to: "/contact" }],
  };
  if (matches(/\b(track\w*|order\w*|parcel\w*|dispatch\w*|cancel\w*)\b/)) return {
    content: "Sign in and open My orders to check your order. Your dispatch email includes a tracking link when your parcel leaves us. I can’t access or change orders; our beauty team can help with a specific order.",
    links: [{ label: "My orders", to: "/orders" }, { label: "Order support", to: "/contact" }],
  };
  if (matches(/\b(deliver\w*|shipping|postage|express)\b/)) return {
    content: "Standard UK delivery usually takes 3–5 working days and is free when you spend over £50. Express delivery takes 1–2 working days when you order before noon. See Shipping & returns for the store’s delivery information.",
    links: [{ label: "Shipping & returns", to: "/shipping-returns" }],
  };
  if (matches(/\b(human|team|contact|support|person|live chat)\b/)) return {
    content: "Our beauty team can help with products and orders. Send an enquiry on our contact page, or sign in to use the existing private live chat.",
    links: [{ label: "Contact the beauty team", to: "/contact" }],
  };
  if (matches(/\b(authentic\w*|genuine|fake|original)\b/)) return {
    content: "Our store FAQ says every product is sourced from trusted brands and verified suppliers. Ask our team if you have a question about a specific item.",
    links: [{ label: "Store FAQ", to: "/faq" }, { label: "Ask the team", to: "/contact" }],
  };
  if (matches(/\b(allerg\w*|rash\w*|eczema|acne|pregnan\w*|medical|sensitive)\b/)) return {
    content: "I can’t assess skin conditions or confirm whether a product is safe for you. Check the product’s ingredients and ask a qualified clinician about allergies or medical concerns. Our team can help with product information.",
    links: [{ label: "Ask about a product", to: "/contact" }],
  };
  if (matches(/\b(product\w*|lip\w*|gloss\w*|matte|foundation|cushion|mascara|brow\w*|blush|makeup|make-up|shade\w*|stock|price\w*|budget|recommend\w*|ingredient\w*|skin\w*|routine\w*)\b/)) return {
    content: "Browse our collection and filter by category, brand or price to find your favourites. Open a product for its details and available shades. For personal recommendations or ingredient questions, ask our beauty team.",
    links: [{ label: "Browse products", to: "/products" }, { label: "Ask the beauty team", to: "/contact" }],
  };
  if (matches(/\b(account|login|log in|sign in|password|register)\b/)) return {
    content: "Use Log in to access your account. If you’ve forgotten your password, use the password help page. Please don’t share passwords or payment details in this chat.",
    links: [{ label: "Log in", to: "/login" }, { label: "Password help", to: "/forgot-password" }],
  };
  if (matches(/^(hi|hello|hey|thanks|thank you)[!?.\s]*$/)) return {
    content: "Hello! I can help with delivery, returns, order tracking and finding products. Pick a topic below or type a question.", links: [],
  };
  return {
    content: "I’m a simple FAQ helper with saved answers, so I may not understand every question. Try delivery, returns, tracking or products, or contact our beauty team for more help.",
    links: [{ label: "All FAQs", to: "/faq" }, { label: "Contact the team", to: "/contact" }],
  };
}
