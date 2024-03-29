import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
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
import { ERRORS, SUCCESS, formatDate, redirect } from "@/lib/utils";

export default function ConfirmPage() {
  const withSuspense = useLoaderData() as () => {
    event: {
      id: string;
      title: string;
      name: string;
      details: string;
      date: Date;
    };
    user: {
      email: string;
      name: string;
    };
    registration: {
      confirmed: boolean;
      waitListed: boolean;
      confirmBefore: string;
    };
    error: string;
  };
  const { event, user, registration, error } = withSuspense();

  const navigate = useNavigate();
  const { toError, toSuccess } = redirect(navigate);
  useEffect(() => {
    if (error) toError({ title: "Une erreur est survenue", message: error });
  }, [error, toError]);

  // Canceling state (for UI)
  const [isCanceling, setIsCanceling] = useState(
    !!registration.confirmed || !!registration.waitListed
  );
  const [reason, setReason] = useState("");
  // Loading state for API calls (button disabled)
  const [isLoading, setIsLoading] = useState(false);

  const [params] = useSearchParams();
  const token = params.get("token")!;

  async function confirm() {
    setIsLoading(true);
    const { data, error } = await client.events[event.id][""].post({
      $query: { token, email: user.email },
    });
    if (data?.success) toSuccess(SUCCESS.REGISTRATION_CONFIRMED);
    else if (error?.status === 401) toError(ERRORS.ON_WAIT_LIST);
    else if (error?.status === 403) toError(ERRORS.INVALID_LINK);
    else if (error?.status === 404) toError(ERRORS.EXPIRED_LINK);
    else toError();
  }

  async function cancel() {
    setIsLoading(true);
    const { data, error } = await client.events[event.id][""].delete({
      reason,
      $query: { token, email: user.email },
    });
    if (data?.success) toSuccess(SUCCESS.REGISTRATION_CANCELED);
    else if (error?.status === 403) toError(ERRORS.INVALID_LINK);
    else if (error?.status === 404) toError(ERRORS.EXPIRED_LINK);
    else toError();
  }

  return (
    <Layout>
      <div className="block">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12">
          {isCanceling
            ? "Désinscription théâtre 🎭"
            : "Inscription au théâtre 🎭"}
        </h1>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{event.name}</CardTitle>
            {event.details && (
              <CardTitle className="font-medium">
                Le {formatDate(event.date)} {event.details}
              </CardTitle>
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
                  <b>confirmer avant le {registration.confirmBefore}</b> pour
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
                    onClick={() =>
                      !registration.waitListed && setIsCanceling(false)
                    }
                    disabled={isLoading || registration.waitListed}
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
    </Layout>
  );
}
