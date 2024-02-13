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
import Layout from "@/components/Layout";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

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
  // Create state for the selected events
  const [selectedEvents, setSelectedEvents] = useState([] as string[]);
  // Create state for the order of preference
  const [preferenceOrder, setPreferenceOrder] = useState([]);

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
    // Handle the second step of the form
    setCurrentStep("step3");
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[600px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Inscription au théâtre 🎭</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Pré-inscrivez-vous pour assister à un ou même plusieurs spectacles{" "}
            <b>gratuitement</b> !
          </p>
        </div>
        <Tabs className="w-full" value={currentStep}>
          <TabsList className="flex">
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
                      <SelectValue placeholder="Choisissez votre classe" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex space-x-2">
                  <Checkbox
                    id="event1"
                    defaultChecked={selectedEvents.includes("1")}
                  />
                  <Label htmlFor="event1">Event 1 - Date: 12/12/2024</Label>
                </div>
                <div className="flex space-x-2">
                  <Checkbox
                    id="event2"
                    defaultChecked={selectedEvents.includes("2")}
                  />
                  <Label htmlFor="event2">Event 2 - Date: 15/12/2024</Label>
                </div>
                <div className="flex space-x-2">
                  <Checkbox
                    id="event3"
                    defaultChecked={selectedEvents.includes("3")}
                  />
                  <Label htmlFor="event3">Event 3 - Date: 20/12/2024</Label>
                </div>
                <div className="flex space-x-2">
                  <Checkbox
                    id="event4"
                    defaultChecked={selectedEvents.includes("4")}
                  />
                  <Label htmlFor="event4">Event 4 - Date: 25/12/2024</Label>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="step3">
            <div className="space-y-4">
              <p className="text-gray-500 dark:text-gray-400">
                Classez les spectacles par ordre de préférence.
                <br />
                Le premier, tout en haut de la liste, est votre spectacle
                préféré.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-200 dark:bg-gray-800 p-2 rounded-md">
                  Event 1 - Date: 12/12/2024
                </div>
                <div className="bg-slate-200 dark:bg-gray-800 p-2 rounded-md">
                  Event 2 - Date: 15/12/2024
                </div>
                <div className="bg-slate-200 dark:bg-gray-800 p-2 rounded-md">
                  Event 3 - Date: 20/12/2024
                </div>
                <div className="bg-slate-200 dark:bg-gray-800 p-2 rounded-md">
                  Event 4 - Date: 25/12/2024
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="text-red-500 dark:text-red-400">{error || ""}</div>
        <div className="flex space-x-4">
          {currentStep === "step1" ? null : (
            <Button
              className="w-full"
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
          <Button className="w-full" type="button" onClick={handleSubmit}>
            Poursuivre l&apos;inscription
            <ArrowRightIcon className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
