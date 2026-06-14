const FAQS = [
  {
    q: "How do I verify my account?",
    a: "After registration, check your email for a 6-digit OTP code. Enter it on the verification page to activate your account.",
  },
  {
    q: "How long does a deposit take to process?",
    a: "Deposits are verified by our admin team within 2–4 hours during business hours (9am–6pm SGT). Weekends may take longer.",
  },
  {
    q: "How do share purchases work?",
    a: "Browse active projects, choose a quantity and payment method, then submit your request. Admin approves and transfers shares to your account.",
  },
  {
    q: "Can I sell my shares?",
    a: "Yes. Log in and navigate to your portfolio, then list your shares for sale. Another community member can purchase through the secondary market.",
  },
  {
    q: "Is my NID number safe?",
    a: "Your NID is stored securely and only used for identity verification. It is never shared with third parties.",
  },
  {
    q: "How do I contact a driver for taxi?",
    a: "After submitting a taxi request our team will WhatsApp you within 1 hour to confirm the driver details.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand-50 px-3 py-1 rounded-full mb-3">
            Contact
          </span>
          <h1 className="text-3xl font-bold text-foreground">Get in Touch</h1>
          <p className="text-muted-foreground mt-2">
            We're here to help the Bangladeshi community in Singapore. Reach us through any channel below.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Contact channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              ),
              title: "WhatsApp",
              value: "+65 XXXX XXXX",
              sub: "Fastest response · 9am–9pm SGT",
              href: "https://wa.me/+65XXXXXXXX",
              label: "Chat on WhatsApp",
              btnClass: "bg-[#25D366] hover:bg-[#1ebe5a] text-white",
            },
            {
              icon: (
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: "Email",
              value: "support@singapurprobashi.com",
              sub: "Reply within 24 hours",
              href: "mailto:support@singapurprobashi.com",
              label: "Send Email",
              btnClass: "bg-brand hover:bg-brand-dark text-white",
            },
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              ),
              title: "Facebook Group",
              value: "Singapur Probashi Community",
              sub: "Community discussions & updates",
              href: "https://facebook.com",
              label: "Join Group",
              btnClass: "bg-[#1877F2] hover:bg-blue-700 text-white",
            },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-2xl border border-border p-6 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                {c.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
              <p className="text-sm text-foreground mb-0.5">{c.value}</p>
              <p className="text-xs text-muted-foreground mb-4 flex-1">{c.sub}</p>
              <a href={c.href} target="_blank" rel="noopener noreferrer"
                className={`text-xs font-semibold px-4 py-2 rounded-lg text-center transition-colors ${c.btnClass}`}>
                {c.label}
              </a>
            </div>
          ))}
        </div>

        {/* Office info */}
        <div className="bg-white rounded-2xl border border-border p-7">
          <h2 className="font-semibold text-foreground mb-4">Office Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Address</p>
              <p className="text-foreground">Mustafa Centre Area<br />Little India, Singapore</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Business Hours</p>
              <p className="text-foreground">Mon–Sat: 10am – 8pm SGT<br />Sunday: Closed</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response Time</p>
              <p className="text-foreground">WhatsApp: Within 1 hour<br />Email: Within 24 hours</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5">
                <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
