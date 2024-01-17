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

const ConfirmEventPage = () => {
  const location = useLocation();
  const [event, setEvent] = useState({ name: "", details: "" });
  const [reminder, setReminder] = useState({ name: "", confirmBefore: "" });
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      // TODO: Redirect to error page
      return console.error("No JWT token provided");
    }

    try {
      // TODO: Validate token
      const payload = jwtDecode(token) as {
        event: { name: string; details: string };
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

  return (
    <main className="flex flex-col items-center justify-center bg-gray-100 p-4 min-h-screen min-w-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-12">
        Inscription au théâtre 🎭
      </h1>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          <CardTitle className="font-medium">{event.details}</CardTitle>
          <CardDescription>
            Vous êtes pré-inscrit à ce spectacle; veuillez confirmer avant le
            {reminder.confirmBefore} pour valider définitivement, faute de quoi
            votre place sera réattribuée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
            <div className="flex space-x-4 pt-4">
              <Button className="flex-1">CONFIRMER</Button>
              <Button className="flex-1" variant="destructive">
                SE DÉSINSCRIRE
              </Button>
            </div>
            {/* <div className="space-y-2">
            <Label htmlFor="reason">Reason for Unsubscribing</Label>
            <Textarea
              id="reason"
              placeholder="Tell us why you are unsubscribing..."
            />
          </div> */}
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
