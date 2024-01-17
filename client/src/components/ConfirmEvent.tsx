import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ConfirmEventPage = () => (
  <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Annual Tech Conference</CardTitle>
        <CardDescription>
          Please confirm your registration details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div className="flex space-x-4">
            <Button className="flex-1">CONFIRM</Button>
            <Button className="flex-1" variant="outline">
              UNSUBSCRIBE
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Unsubscribing</Label>
            <Textarea
              id="reason"
              placeholder="Tell us why you are unsubscribing..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
    <footer className="fixed bottom-5 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Made with
        <span className="text-red-500"> ❤ </span>
        by Nathan{"\n          "}
      </p>
      <a className="text-blue-500 hover:underline" href="#">
        Visit my GitHub profile
      </a>
    </footer>
  </main>
);

export default ConfirmEventPage;
