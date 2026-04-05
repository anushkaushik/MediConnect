import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { bookAppointment, type MatchResult } from "@/api/medimatch";
import {
  UserRound,
  Hospital,
  Phone,
  Lightbulb,
  Pill,
  ShieldAlert,
  CalendarCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface DoctorResultCardProps {
  result: MatchResult;
  patientName: string;
  symptoms: string;
}

const DoctorResultCard = ({ result, patientName, symptoms }: DoctorResultCardProps) => {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingName, setBookingName] = useState(patientName);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const slots = result.available_slots
    ? result.available_slots.split(",").map((s) => s.trim())
    : [];

  const handleBook = async () => {
    if (!selectedSlot || !bookingName.trim()) return;
    setLoading(true);
    try {
      const res = await bookAppointment(
        result.doctor_id,
        bookingName,
        selectedSlot,
        symptoms
      );
      setBooked(true);
      toast({
        title: "Appointment Confirmed! ✅",
        description: `${res.details.doctor} at ${res.details.hospital} — ${res.details.slot}`,
      });
    } catch (e: any) {
      toast({
        title: "Booking failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">{result.doctor_name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {result.specialization}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Info Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Hospital className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Hospital</p>
              <p className="text-sm font-semibold text-foreground">{result.hospital}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Phone className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <p className="text-sm font-semibold text-foreground">{result.phone}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="flex items-start gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-medium text-primary">Why this doctor?</p>
            <p className="text-sm text-foreground">{result.reason}</p>
          </div>
        </div>

        {/* Medicines */}
        {result.suggested_medicines?.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Pill className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Suggested Medicines</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.suggested_medicines.map((m, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Precautions */}
        {result.precautions && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/10 bg-destructive/5 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="text-xs font-medium text-destructive">Precaution</p>
              <p className="text-sm text-foreground">{result.precautions}</p>
            </div>
          </div>
        )}

        {/* Booking Section */}
        {!booked ? (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <h4 className="font-display font-semibold">Book Appointment</h4>
            </div>
            <Input
              placeholder="Your full name"
              value={bookingName}
              onChange={(e) => setBookingName(e.target.value)}
            />
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleBook}
              disabled={loading || !selectedSlot || !bookingName.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Booking…
                </>
              ) : (
                "Confirm Appointment"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Appointment Confirmed!</p>
              <p className="text-sm text-muted-foreground">
                {selectedSlot} with {result.doctor_name}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorResultCard;
