import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Building2, CreditCard, Hash, Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Umair Accounts Dept — Restaurant Banking Details" },
      {
        name: "description",
        content:
          "Securely submit your restaurant's banking details to the Umair Accounts Department.",
      },
    ],
  }),
  component: Index,
});

const schema = z.object({
  restaurantName: z.string().trim().min(1, "Restaurant name is required").max(120),
  accountNo: z
    .string()
    .trim()
    .min(4, "Account number looks too short")
    .max(34, "Account number looks too long")
    .regex(/^[A-Za-z0-9-]+$/, "Only letters, numbers and dashes"),
  routingNo: z
    .string()
    .trim()
    .min(6, "Routing number looks too short")
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, "Only letters, numbers and dashes"),
  email: z.string().trim().email("Enter a valid email").max(255),
});

type FormData = z.infer<typeof schema>;

function Index() {
  const [form, setForm] = useState<FormData>({
    restaurantName: "",
    accountNo: "",
    routingNo: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSubmitted(true);
    toast.success("Details submitted to the accounts department");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-12">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-8 items-center">
        {/* Brand panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase">
            Accounts Department
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Umair <span className="text-primary">Accounts</span> Intake
          </h1>
          <p className="text-muted-foreground text-lg">
            Submit your restaurant's banking details securely. Our team uses these for
            payouts and reconciliation.
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Encrypted submission",
              "Reviewed within 1 business day",
              "Used only for payments & reconciliation",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <Card className="lg:col-span-3 p-8 shadow-elegant border-border/60">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Submission received</h2>
              <p className="text-muted-foreground">
                Thank you, <span className="font-medium text-foreground">{form.restaurantName}</span>.
                The accounts team will be in touch shortly.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ restaurantName: "", accountNo: "", routingNo: "", email: "" });
                }}
              >
                Submit another
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Banking Details</h2>
                <p className="text-sm text-muted-foreground">
                  All fields are required.
                </p>
              </div>

              <Field
                id="restaurantName"
                label="Restaurant Name"
                icon={<Building2 className="w-4 h-4" />}
                value={form.restaurantName}
                onChange={update("restaurantName")}
                placeholder="e.g. Blue Olive Bistro"
                error={errors.restaurantName}
              />
              <Field
                id="accountNo"
                label="Account Number"
                icon={<CreditCard className="w-4 h-4" />}
                value={form.accountNo}
                onChange={update("accountNo")}
                placeholder="000123456789"
                error={errors.accountNo}
                inputMode="numeric"
              />
              <Field
                id="routingNo"
                label="Routing Number"
                icon={<Hash className="w-4 h-4" />}
                value={form.routingNo}
                onChange={update("routingNo")}
                placeholder="021000021"
                error={errors.routingNo}
                inputMode="numeric"
              />
              <Field
                id="email"
                label="Email Address"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={update("email")}
                placeholder="owner@restaurant.com"
                error={errors.email}
                type="email"
              />

              <Button type="submit" variant="hero" size="lg" className="w-full">
                Submit to Accounts
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  inputMode,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  inputMode?: "numeric" | "text" | "email";
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          inputMode={inputMode}
          className={`pl-9 h-11 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
