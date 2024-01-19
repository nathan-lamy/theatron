import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { ERRORS, SUCCESS, redirect } from "@/lib/utils";

// TODO: Add global loading state to avoid flashing content
const ConfirmEventPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toError, toSuccess } = redirect(navigate);

  // JWT token from URL query params
  const [token, setToken] = useState("");
  // Pre-populate form with data from JWT token
  const [event, setEvent] = useState({ id: "", title: "", details: "" });
  const [reminder, setReminder] = useState({ name: "", confirmBeforeDate: "" });
  const [user, setUser] = useState({ name: "", email: "" });
  // Canceling state (for UI)
  const [isCanceling, setIsCanceling] = useState(false);
  const [reason, setReason] = useState("");
  // Loading state for API calls (button disabled)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (!token) return toError(ERRORS.INVALID_OR_MISSING_TOKEN);
    setToken(token);

    try {
      const payload = jwtDecode(token) as {
        event: { id: string; title: string; details: string };
        reminder: { name: string; confirmBeforeDate: string };
        user: { name: string; email: string };
      };
      // TODO: Validate payload
      setEvent(payload.event);
      setReminder(payload.reminder);
      setUser(payload.user);
    } catch (err) {
      // TODO: Sentry
      console.error(err);
      return toError(ERRORS.INVALID_OR_MISSING_TOKEN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  async function confirm() {
    setIsLoading(true);
    await client.events[":id"].$post({
      param: { id: event.id },
      json: { token },
    });
    toSuccess(SUCCESS.REGISTRATION_CONFIRMED);
  }

  async function cancel() {
    setIsLoading(true);
    await client.events[":id"].$delete({
      param: { id: event.id },
      json: { token, reason },
    });
    toSuccess(SUCCESS.REGISTRATION_CANCELED);
  }

  return (
    <main className="flex flex-col bg-gray-100 p-4 pt-0">
      <div className="flex-1 flex justify-center items-center">
        <div className="block">
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12">
            {isCanceling
              ? "Désinscription théâtre 🎭"
              : "Inscription au théâtre 🎭"}
          </h1>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              {event.details && (
                <CardTitle className="font-medium">{event.details}</CardTitle>
              )}
              <CardDescription>
                {isCanceling ? (
                  <>
                    Vous êtes sur le point de vous <b>désinscrire</b> de ce
                    spectacle. Renseignez le motif de votre désinscription et
                    cliquez sur le bouton ci-dessous pour confirmer.
                  </>
                ) : (
                  <>
                    Vous êtes pré-inscrit à ce spectacle.
                    <br />
                    Veuillez{" "}
                    <b>confirmer avant le {reminder.confirmBeforeDate}</b> pour
                    valider définitivement, faute de quoi votre place sera
                    réattribuée.
                  </>
                )}
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
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        placeholder="Monsieur Saly"
                        value={user.name}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse mail</Label>
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
                    onClick={isCanceling ? cancel : () => setIsCanceling(true)}
                    disabled={isLoading}
                  >
                    {isLoading && isCanceling && (
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    SE DÉSINSCRIRE
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <footer className="flex flex-col text-center">
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
