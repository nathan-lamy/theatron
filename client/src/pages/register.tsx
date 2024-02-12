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

export default function Register() {
  return (
    <>
      <div className="mx-auto max-w-[600px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Event Registration</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Register for your favorite events in three simple steps.
          </p>
        </div>
        <Tabs className="w-full" value="step1">
          <TabsList className="flex justify-between">
            <TabsTrigger value="step1">
              Step 1: Identity Information
            </TabsTrigger>
            <TabsTrigger value="step2">Step 2: Event Selection</TabsTrigger>
            <TabsTrigger value="step3">Step 3: Priority Sorting</TabsTrigger>
          </TabsList>
          <TabsContent value="step1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Doe" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class-level">Class Level</Label>
                  <Select required>
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
                  <Label htmlFor="class-number">Class Number</Label>
                  <Input
                    id="class-number"
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
                <div className="space-y-2">
                  <Checkbox id="event1" name="event" />
                  <Label className="text-sm font-normal" htmlFor="event1">
                    Event 1 - Date: 12/12/2024
                  </Label>
                </div>
                <div className="space-y-2">
                  <Checkbox id="event2" name="event" />
                  <Label className="text-sm font-normal" htmlFor="event2">
                    Event 2 - Date: 15/12/2024
                  </Label>
                </div>
                <div className="space-y-2">
                  <Checkbox id="event3" name="event" />
                  <Label className="text-sm font-normal" htmlFor="event3">
                    Event 3 - Date: 20/12/2024
                  </Label>
                </div>
                <div className="space-y-2">
                  <Checkbox id="event4" name="event" />
                  <Label className="text-sm font-normal" htmlFor="event4">
                    Event 4 - Date: 25/12/2024
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="step3">
            <div className="space-y-4">
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop to sort your selected events by priority.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                  Event 1 - Date: 12/12/2024
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                  Event 2 - Date: 15/12/2024
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                  Event 3 - Date: 20/12/2024
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                  Event 4 - Date: 25/12/2024
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Button className="w-full" type="submit">
          Register
        </Button>
      </div>
    </>
  );
}
