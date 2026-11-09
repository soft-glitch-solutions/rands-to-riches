
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  Send,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — MOTUS Capital" },
      {
        name: "description",
        content:
          "Get in touch with the MOTUS Capital team. We're here to answer your questions about investing in the South African mobility economy.",
      },
    ],
  }),
  component: ContactPage,
});

// Contact details
const CONTACT_DETAILS = [
  {
    Icon: Mail,
    label: "Email us",
    value: "hello@motuscapital.co.za",
    href: "mailto:hello@motuscapital.co.za",
  },
  {
    Icon: Phone,
    label: "Call us",
    value: "+27 82 123 4567",
    href: "tel:+27821234567",
  },
  {
    Icon: MapPin,
    label: "Visit us",
    value: "Johannesburg, South Africa",
    href: "https://maps.google.com/?q=Johannesburg,+South+Africa",
  },
  {
    Icon: Clock,
    label: "Office hours",
    value: "Mon – Fri, 08:00 – 17:00 SAST",
    href: undefined,
  },
];

// Social media links
const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/motuscapital",
    Icon: Facebook,
    color: "hover:bg-blue-600",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/motuscapital",
    Icon: Instagram,
    color: "hover:bg-pink-600",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@MotusCapital",
    Icon: Youtube,
    color: "hover:bg-red-600",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@motus.capital",
    Icon: Music2,
    color: "hover:bg-black",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I start investing?",
    a: "Create an account on our platform, choose your plan (1 month from R100, or 2–3 months for amounts up to R10,000), and select your preferred maturity action.",
  },
  {
    q: "What happens at the end of the investment cycle?",
    a: "At the end of your 30, 60 or 90-day cycle, you can withdraw your principal and returns, or automatically roll it into the next cycle. You can change your choice at any time.",
  },
  {
    q: "Are my returns guaranteed?",
    a: "No. Returns depend on the actual performance of the underlying vehicle operations and applicable fees. Investment capital and returns are subject to investment risks. Always invest only what you can afford.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us via email or phone using the contact details on this page. We aim to respond within one business day.",
  },
];

type FormState = "idle" | "sending" | "sent" | "error";

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setFormState("sending");

    // Replace with a real API call.
    await new Promise((r) => setTimeout(r, 1200));
    setFormState("sent");
  };

  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-secondary py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            Get in touch
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            We'd love to hear from you.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Have a question about investing, our platform, or how MOTUS Capital
            works? Reach out — our team is here to help.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in the form and we'll get back to you within one business
              day.
            </p>

            {formState === "sent" ? (
              <div className="mt-8 rounded-3xl border border-border bg-accent p-8 text-center">
                <span className="flex size-14 mx-auto items-center justify-center rounded-full bg-brand-green">
                  <Send className="size-6 text-white" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                  Message sent!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanks for reaching out, {name.split(" ")[0]}. We'll be in
                  touch shortly.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setFormState("idle");
                    setName("");
                    setEmail("");
                    setSubject("");
                    setMessage("");
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-foreground"
                    >
                      Full name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Dlamini"
                      className="mt-1.5 block w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-foreground"
                    >
                      Email address <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.co.za"
                      className="mt-1.5 block w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="How does the investment cycle work?"
                    className="mt-1.5 block w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-foreground"
                  >
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help…"
                    className="mt-1.5 block w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {formState === "error" && (
                  <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={formState === "sending"}
                  className="w-full rounded-2xl text-base font-bold sm:w-auto"
                >
                  {formState === "sending" ? (
                    <>
                      <Send className="mr-2 size-4 animate-pulse" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Contact details + socials */}
          <div className="space-y-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Contact details
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Prefer to reach us directly? Here's how.
              </p>
              <ul className="mt-6 space-y-4">
                {CONTACT_DETAILS.map(({ Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
                      <Icon className="size-4 text-primary" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="mt-0.5 text-sm font-medium text-foreground hover:text-primary"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social media */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Follow us
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Stay up to date with MOTUS Capital on social media.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {SOCIAL_LINKS.map(({ label, href, Icon, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-transparent hover:text-white ${color}`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Quick answers to the most common questions we receive.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="rounded-2xl bg-card p-6 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground">
                  {q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
