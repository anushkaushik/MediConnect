import { useState } from "react";
import WelcomeDialog from "@/components/WelcomeDialog";
import SymptomForm from "@/components/SymptomForm";
import ChatPanel from "@/components/ChatPanel";
import { Stethoscope, MapPin, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  name: string;
  email: string;
  city: string;
}

const Index = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const showDialog = !user;

  return (
    <div className="min-h-screen bg-background">
      <WelcomeDialog open={showDialog} onComplete={setUser} />

      {user && (
        <>
          {/* Top Nav */}
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <span className="font-display text-xl font-bold text-foreground">MediConnect</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{user.city}</span>
                <span className="text-border">|</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUser(null)}
                  className="text-muted-foreground"
                >
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-3xl px-4 py-12">
            {/* Header */}
            <div className="mb-10 text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Hi, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Tell us what's bothering you and our AI will match you with the right doctor in{" "}
                <span className="font-semibold text-primary">{user.city}</span>.
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="match" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="match" className="gap-2">
                  <Search className="h-4 w-4" />
                  Quick Match
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat with AI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="match">
                <SymptomForm userName={user.name.split(" ")[0]} city={user.city} />
              </TabsContent>

              <TabsContent value="chat">
                <ChatPanel city={user.city} />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
