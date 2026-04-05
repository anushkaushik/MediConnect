import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stethoscope } from "lucide-react";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Bhopal",
  "Kochi",
  "Indore",
  "Nagpur",
];

interface WelcomeDialogProps {
  open: boolean;
  onComplete: (data: { name: string; email: string; city: string }) => void;
}

const WelcomeDialog = ({ open, onComplete }: WelcomeDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && city) {
      onComplete({ name, email, city });
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Stethoscope className="h-7 w-7" />
          </div>
          <DialogTitle className="font-display text-2xl">Welcome to MediConnect</DialogTitle>
          <DialogDescription>
            Sign in and select your city to find the best doctors near you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>City / Town</Label>
            <Select value={city} onValueChange={setCity} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={!name || !email || !city}
            size="lg"
          >
            Get Started
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
