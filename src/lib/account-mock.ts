// Mock signed-in customer — there's no auth yet, so these account pages are
// built against a placeholder persona rather than any real login/session.
// Her enquiries live in admin-leads.ts (filtered by email below) rather than
// a separate mock array, so the admin and account views share one dataset.
export const accountCustomer = {
  firstName: "Sarah",
  lastName: "Whitfield",
  email: "sarah.whitfield@gmail.com",
  phone: "07700 900123",
  address: "14 Latchmere Road, London",
  postcode: "SW11 4RT",
};
