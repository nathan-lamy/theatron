import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import update from "immutability-helper";
import Layout from "@/components/Layout";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Event, client } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { EventCard } from "@/components/EventCard";

export default function Register() {
  // Create state for the current step
  const [currentStep, setCurrentStep] = useState("step1");
  const [error, setError] = useState("");
  // Create state for the form inputs (email, first name, last name, class level, class number)
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [classNumber, setClassNumber] = useState("");
  // Create state for the selected events and the preference order
  const [events, setEvents] = useState([] as Event[]);
  const [selectedEvents, setSelectedEvents] = useState([] as string[]);
  const [preferenceOrder, setPreferenceOrder] = useState([] as string[]);

  useEffect(() => {
    // Fetch the events from the API
    const req = client.events.get();
    void req.then(({ data, error }) => {
      // TODO:
      if (error) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!data["success"]) return;
      setEvents(data.events as Event[]);
    });
  }, []);

  function handleSubmit() {
    // Handle form submission
    let handler: (() => string | undefined) | undefined;
    if (currentStep === "step1") handler = handleFirstStep;
    if (currentStep === "step2") handler = handleSecondStep;
    if (currentStep === "step3") handler = handleThirdStep;
    if (!handler) return;
    // If there is an error, display it
    const error = handler();
    if (error) setError(error);
    else setError("");
  }

  function handleFirstStep() {
    if (!email) {
      return "Merci de renseigner votre adresse mail.";
    }
    if (!firstName || !lastName) {
      return "Merci de renseigner votre prénom et votre nom.";
    }
    if (!classLevel || !classNumber) {
      return "Merci de renseigner votre niveau et votre classe.";
    }
    // Handle the first step of the form
    setCurrentStep("step2");
  }

  function handleSecondStep() {
    // Save the selected events
    const selectedIds = [] as string[];
    const checkboxes = document.querySelectorAll(
      'button[role="checkbox"][id^="event"][data-state="checked"]'
    );
    if (!checkboxes.length) {
      return "Merci de sélectionner au moins un spectacle.";
    }
    checkboxes.forEach((checkbox) =>
      selectedIds.push(checkbox.id.replace("event", ""))
    );
    setSelectedEvents(selectedIds);
    // If the preference order does not contain the same events as the selected events, reset the preference order
    if (
      selectedIds.some((id) => !preferenceOrder.includes(id)) ||
      selectedIds.length !== preferenceOrder.length
    ) {
      setPreferenceOrder(selectedIds);
    }
    // Handle the second step of the form
    setCurrentStep("step3");
  }

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setPreferenceOrder((prevCards: string[]) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      })
    );
  }, []);

  const renderCard = useCallback(
    (id: string, index: number) => {
      const event = events.find((event) => event.id.toString() === id);
      if (event)
        return (
          <EventCard
            key={`event${id}`}
            index={index}
            id={`event-card${id}`}
            event={event}
            moveCard={moveCard}
          />
        );
      else return null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [events, moveCard]
  );

  return (
    <DndProvider backend={TouchBackend}>
      <Layout>
        <div className="block mx-auto space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Inscription au théâtre 🎭</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Pré-inscrivez-vous pour assister à un ou même plusieurs spectacles{" "}
              <b>gratuitement</b> !
            </p>
          </div>
          <Tabs className="w-full" value={currentStep}>
            <TabsList className="hidden lg:flex">
              <TabsTrigger value="step1">
                Étape 1 : Informations personnelles
              </TabsTrigger>
              <TabsTrigger value="step2">
                Étape 2 : Sélection des spectacles
              </TabsTrigger>
              <TabsTrigger value="step3">
                Étape 3 : Ordre de préférence
              </TabsTrigger>
            </TabsList>
            <TabsContent value="step1">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse mail</Label>
                  <Input
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={email}
                    placeholder="adrien.saly@ac-nice.fr"
                    required
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Prénom</Label>
                    <Input
                      id="first-name"
                      onChange={(e) => setFirstName(e.target.value)}
                      defaultValue={firstName}
                      placeholder="Adrien"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Nom</Label>
                    <Input
                      id="last-name"
                      onChange={(e) => setLastName(e.target.value)}
                      defaultValue={lastName}
                      placeholder="SALY"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-level">Niveau</Label>
                    <Select
                      onValueChange={(val) => setClassLevel(val)}
                      defaultValue={classLevel}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Votre classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="seconde">Seconde</SelectItem>
                          <SelectItem value="premiere">Première</SelectItem>
                          <SelectItem value="terminale">Terminale</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class-number">
                      Classe (lettre ou numéro)
                    </Label>
                    <Input
                      id="class-number"
                      onChange={(e) => setClassNumber(e.target.value)}
                      defaultValue={classNumber}
                      maxLength={1}
                      placeholder="A"
                      required
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="step2">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <div
                      className="flex space-x-2 items-center"
                      key={event.id.toString()}
                    >
                      <Checkbox
                        id={`event${event.id}`}
                        defaultChecked={selectedEvents.includes(
                          event.id.toString()
                        )}
                      />
                      <Label htmlFor={`event${event.id}`}>
                        {event.name}
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">
                          Le {formatDate(event.date)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="step3">
              <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                  Classez les spectacles que vous avez sélectionnés par ordre de
                  préférence.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {preferenceOrder.map(renderCard)}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="text-red-500 dark:text-red-400">{error || ""}</div>
          <div className="flex space-x-4">
            {currentStep === "step1" ? null : (
              <Button
                className="w-full shadow"
                type="button"
                onClick={() =>
                  setCurrentStep("step" + (Number(currentStep[4]) - 1))
                }
                variant="secondary"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Retour
              </Button>
            )}
            <Button
              className="w-full shadow"
              type="button"
              onClick={handleSubmit}
            >
              Poursuivre l&apos;inscription
              <ArrowRightIcon className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Layout>
    </DndProvider>
  );
}
