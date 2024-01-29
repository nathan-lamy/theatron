import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";

export default function LoadingConfirmPage() {
  return (
    <main className="flex flex-col bg-gray-100 p-4 pt-0">
      <div className="flex-1 flex justify-center items-center">
        <div className="block w-full max-w-md">
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12">
            <Skeleton className="h-9 w-96 mx-auto" />
          </h1>
          <Card className="mx-auto w-full max-w-md h-full">
            <CardHeader>
              <CardTitle className="text-2xl">
                <Skeleton className="h-8" />
                <Skeleton className="h-4 mt-2" />
              </CardTitle>
              <Skeleton className="h-14" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-10" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-10" />
                </div>
                <div className="flex space-x-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
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
