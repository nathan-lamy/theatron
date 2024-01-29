/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
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
import Footer from "@/components/Footer";
import { client } from "@/lib/api";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ERRORS, SUCCESS, redirect } from "@/lib/utils";
import type { EventPayload } from "@server/index";

export default function ConfirmPage() {
  // TODO: Validate payload
  const withSuspense = useLoaderData() as () => EventPayload;
  const { event, user, confirmBeforeDate } = withSuspense();

  const navigate = useNavigate();
  const { toError, toSuccess } = redirect(navigate);

  // Canceling state (for UI)
  const [isCanceling, setIsCanceling] = useState(false);
  const [reason, setReason] = useState("");
  // Loading state for API calls (button disabled)
  const [isLoading, setIsLoading] = useState(false);

  const [params] = useSearchParams();
  const token = params.get("token")!;

  async function confirm() {
    setIsLoading(true);
    const res = await client.events[":id"].$post({
      param: { id: event.id },
      query: { token, email: user.email },
    });
    if (res.status === 200) toSuccess(SUCCESS.REGISTRATION_CONFIRMED);
    // if (res.status === 403) toError(ERRORS.INVALID_TOKEN);
    // if (res.status === 404) toError(ERRORS.EVENT_NOT_FOUND);
    else toError();
  }

  async function cancel() {
    setIsLoading(true);
    const res = await client.events[":id"].$delete({
      param: { id: event.id },
      json: { reason },
      query: { token, email: user.email },
    });
    if (res.status === 200) toSuccess(SUCCESS.REGISTRATION_CANCELED);
    else toError();
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
                    Veuillez <b>confirmer avant le {confirmBeforeDate}</b> pour
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
                      onClick={() => {
                        void confirm();
                      }}
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
      <Footer />
    </main>
  );
}
