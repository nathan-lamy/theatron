import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/api";
import { ReloadIcon } from "@radix-ui/react-icons";

const ConfirmEventPage = () => {
  const location = useLocation();
  // JWT token from URL query params
  const [token, setToken] = useState("");
  // Pre-populate form with data from JWT token
  const [event, setEvent] = useState({ id: "", name: "", details: "" });
  const [reminder, setReminder] = useState({ name: "", confirmBefore: "" });
  const [user, setUser] = useState({ name: "", email: "" });
  // Canceling state (for UI)
  const [isCanceling, setIsCanceling] = useState(false);
  const [reason, setReason] = useState("");
  // Loading state for API calls (button disabled)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      // TODO: Redirect to error page
      return console.error("No JWT token provided");
    }
    setToken(token);

    try {
      // TODO: Validate token
      const payload = jwtDecode(token) as {
        event: { id: string; name: string; details: string };
        reminder: { name: string; confirmBefore: string };
        user: { name: string; email: string };
      };
      // TODO: Validate payload
      setEvent(payload.event);
      setReminder(payload.reminder);
      setUser(payload.user);
    } catch (err) {
      // TODO: Redirect to error page & send error to Sentry
      console.error("Invalid JWT token:", err);
    }
  }, [location.search]);

  async function confirm() {
    setIsLoading(true);
    await client.events[":id"].$post({
      param: { id: event.id },
      json: { token },
    });
    // TODO: Redirect to success page (or error page)
  }

  async function unregister() {
    setIsLoading(true);
    await client.events[":id"].$delete({
      param: { id: event.id },
      json: { token, reason },
    });
    // TODO: Redirect to success page (or error page)
  }

  return (
    <main className="flex flex-col items-center justify-center bg-gray-100 p-4 min-h-screen min-w-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-12">
        {isCanceling
          ? "Désinscription du théâtre 🎭"
          : "Inscription au théâtre 🎭"}
      </h1>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          <CardTitle className="font-medium">{event.details}</CardTitle>
          <CardDescription>
            {isCanceling
              ? "Vous êtes sur le point de vous désinscrire de ce spectacle. Renseignez le motif de votre désinscription et cliquez sur le bouton ci-dessous pour confirmer."
              : `Vous êtes pré-inscrit à ce spectacle. Veuillez confirmer avant le ${reminder.confirmBefore} pour valider définitivement, faute de quoi votre place sera réattribuée.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isCanceling ? (
              <div className="space-y-2">
                <Label htmlFor="reason">Motif de la désinscription</Label>
                <Textarea
                  id="reason"
                  placeholder="Je ne peux plus venir..."
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Votre nom</Label>
                  <Input
                    id="name"
                    placeholder="Monsieur Saly"
                    value={user.name}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Votre adresse mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="adrien.saly@ac-nice.fr"
                    value={user.email}
                    disabled
                  />
                </div>
              </>
            )}
            <div className="flex space-x-4 pt-4">
              {isCanceling ? (
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setIsCanceling(false)}
                  disabled={isLoading}
                >
                  ANNULER
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={confirm}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  CONFIRMER
                </Button>
              )}
              <Button
                className="flex-1"
                variant="destructive"
                onClick={isCanceling ? unregister : () => setIsCanceling(true)}
                disabled={isLoading}
              >
                {isLoading && isCanceling && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isCanceling ? "CONFIRMER LA DÉSINSCRIPTION" : "SE DÉSINSCRIRE"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <footer className="absolute bottom-5 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Made with
          <span className="text-red-500"> ❤ </span>
          by Nathan for Mister Saly{"\n          "}
        </p>
        <a
          className="text-blue-500 hover:underline"
          href="mailto:adrien.saly@ac-nice.fr"
        >
          Un problème ? Contactez-moi !
        </a>
      </footer>
    </main>
  );
};

export default ConfirmEventPage;
