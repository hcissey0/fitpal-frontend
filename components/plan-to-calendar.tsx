import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FitnessPlan } from "@/interfaces";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { addPlanToGoogleCalendar, deleteFitPalCalendar, removePlanFromGoogleCalendar } from "@/lib/api-service";
import { handleApiError } from "@/lib/error-handler";
import { useEffect, useState } from "react";
import { Loader2, Calendar as CalendarIcon, Clock, Link as LinkIcon, CheckCircle, Zap, Bell, Trash } from "lucide-react";
import { useData } from "@/context/data-context";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

const Calender = ({ className }: { className?: string }) => (
  <div className={cn(className, "")}>
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
      <rect width="22" height="22" x="13" y="13" fill="#fff"></rect>
      <polygon
        fill="#1e88e5"
        points="25.68,20.92 26.688,22.36 28.272,21.208 28.272,29.56 30,29.56 30,18.616 28.56,18.616"
      ></polygon>
      <path
        fill="#1e88e5"
        d="M22.943,23.745c0.625-0.574,1.013-1.37,1.013-2.249c0-1.747-1.533-3.168-3.417-3.168 c-1.602,0-2.972,1.009-3.33,2.453l1.657,0.421c0.165-0.664,0.868-1.146,1.673-1.146c0.942,0,1.709,0.646,1.709,1.44 c0,0.794-0.767,1.44-1.709,1.44h-0.997v1.728h0.997c1.081,0,1.993,0.751,1.993,1.64c0,0.904-0.866,1.64-1.931,1.64 c-0.962,0-1.784-0.61-1.914-1.418L17,26.802c0.262,1.636,1.81,2.87,3.6,2.87c2.007,0,3.64-1.511,3.64-3.368 C24.240,25.281,23.736,24.363,22.943,23.745z"
      ></path>
      <polygon
        fill="#fbc02d"
        points="34,42 14,42 13,38 14,34 34,34 35,38"
      ></polygon>
      <polygon
        fill="#4caf50"
        points="38,35 42,34 42,14 38,13 34,14 34,34"
      ></polygon>
      <path
        fill="#1e88e5"
        d="M34,14l1-4l-1-4H9C7.343,6,6,7.343,6,9v25l4,1l4-1V14H34z"
      ></path>
      <polygon fill="#e53935" points="34,34 34,42 42,34"></polygon>
      <path fill="#1565c0" d="M39,6h-5v8h8V9C42,7.343,40.657,6,39,6z"></path>
      <path fill="#1565c0" d="M9,42h5v-8H6v5C6,40.657,7.343,42,9,42z"></path>
    </svg>
  </div>
);

const calendarIntegrationTips = [
  {
    icon: CalendarIcon,
    title: "Syncing with Google Calendar",
    description:
      "Adding your fitness plan events to your Google Calendar for easy scheduling.",
    color: "text-blue-500",
  },
  {
    icon: Clock,
    title: "Scheduling Workouts",
    description:
      "Creating time blocks for your workout sessions based on your preferences.",
    color: "text-purple-500",
  },
  {
    icon: Bell,
    title: "Setting Reminders",
    description:
      "Adding notifications to help you stay on track with your fitness goals.",
    color: "text-orange-500",
  },
  {
    icon: LinkIcon,
    title: "Calendar Integration",
    description:
      "Seamlessly integrating your nutrition and workout schedules.",
    color: "text-green-500",
  },
  {
    icon: CheckCircle,
    title: "Plan Organization",
    description:
      "Organizing your fitness events with proper titles and descriptions.",
    color: "text-emerald-500",
  },
  {
    icon: Zap,
    title: "Quick Access",
    description:
      "Making your fitness plan easily accessible from any device with Google Calendar.",
    color: "text-yellow-500",
  },
];

export default function PlanToCalendar({
  plan,
  className,
}: {
  plan: FitnessPlan;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "all" | "workout" | "nutrition"
  >("all");
  const { settings } = useData();
  const { refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (plan.nutrition_added_to_calendar && !plan.workout_added_to_calendar)
      setSelectedType("workout");
    if (plan.workout_added_to_calendar && !plan.nutrition_added_to_calendar)
      setSelectedType("nutrition");
  }, []);

  // Slideshow effect for tips during loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % calendarIntegrationTips.length);
      }, 2500); // Change tip every 2.5 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await addPlanToGoogleCalendar(plan.id, selectedType);
      toast.success(
        `${
          selectedType === "all"
            ? "Plan"
            : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
        } successfully added to Google Calendar`
      );
      setIsOpen(false);
      await refreshUser();
    } catch (e) {
      handleApiError(e, "Failed to add to Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonName = plan.workout_added_to_calendar
    ? plan.nutrition_added_to_calendar
      ? "Delete Plan from Google Calendar"
      : "Add Nutrition to Google Calendar"
    : plan.nutrition_added_to_calendar
    ? "Add Workout to Google Calendar"
    : "Add Plan to Google Calendar";

  if (
    !settings.connectedToGoogleAccount
  ) {
    return null;
  }
  const handleDeletePlanFromCalendar = async () => {
    try {
      setIsLoading(true);
      await removePlanFromGoogleCalendar(plan.id, selectedType);
      toast.success(
        `${
          selectedType === "all"
            ? "Plan"
            : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
        } successfully removed from Google Calendar`
      );
      setIsOpen(false);
      await refreshUser();
    } catch (e) {
      handleApiError(e, "Failed to remove from Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCalendar = async () => {
    try {
      setIsLoading(true);
      await deleteFitPalCalendar();
      toast.success("FitPal calendar successfully deleted");
      setIsOpen(false);
      await refreshUser();
    } catch (e) {
      handleApiError(e, "Failed to delete FitPal calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const currentTip = calendarIntegrationTips[currentTipIndex];
  const IconComponent = currentTip.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button
          className={cn(className, "glass text-foreground")}
        >
          <Calender /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle className="flex gap-3">
            <Calender className="h-5 w-5" />
            Add Plan to Google Calender
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isLoading
              ? "Adding your plan to Google Calendar. This may take a moment..."
              : "Please take note that this is a long running task so it might take a while to reflect."}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          // Slideshow during loading
          <div className="flex flex-col items-center justify-center space-y-6 py-8 px-4 min-h-[200px]">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 w-16 h-16"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20">
                <IconComponent
                  className={`h-8 w-8 ${currentTip.color} animate-pulse`}
                />
              </div>
            </div>

            <div className="text-center space-y-3 max-w-md">
              <h3 className="text-lg font-semibold text-foreground transition-all duration-500 ease-in-out">
                {currentTip.title}
              </h3>
              <p className="text-sm text-muted-foreground transition-all duration-500 ease-in-out">
                {currentTip.description}
              </p>
            </div>

            <div className="flex space-x-2">
              {calendarIntegrationTips.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentTipIndex
                      ? "bg-primary scale-125"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span>Adding to calendar...</span>
            </div>
          </div>
        ) : (
          // Regular content when not loading
          <div className="flex flex-col gap-6">
            <div>Select what to add:</div>
            <div className="flex justify-around">
              {["all", "workout", "nutrition"].map((t) => (
                <Button
                  key={t}
                  // disabled={
                  //   (t === "workout" && plan.workout_added_to_calendar) ||
                  //   (t === "nutrition" && plan.nutrition_added_to_calendar) ||
                  //   (t === "all" &&
                  //     (plan.workout_added_to_calendar ||
                  //       plan.nutrition_added_to_calendar))
                  // }
                  onClick={() =>
                    setSelectedType(t as "all" | "workout" | "nutrition")
                  }
                  className={`text-foreground p-2 rounded-lg border 
                                  ${
                                    selectedType === t
                                      ? "border-primary-500 bg-primary-700 font-bold"
                                      : "glass"
                                  }                                
                                  `}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          <DialogClose asChild>
            <Button
              disabled={isLoading}
              size={'sm'}
              className="bg-transparent text-foreground"
            >
              Cancel
            </Button>
          </DialogClose>
          {((plan.workout_added_to_calendar || plan.nutrition_added_to_calendar || plan.google_calendar_id) && selectedType === 'all') && (
            <Button
              disabled={isLoading}
              size={'sm'}
              onClick={handleDeleteCalendar}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                <Trash className="w-4 h-4 mr-1" />
                {"Delete FitPal Calendar"}
                </>
              )}
            </Button>
          )}
          {((selectedType === "workout" && plan.workout_added_to_calendar) ||
           (selectedType === "nutrition" && plan.nutrition_added_to_calendar)) && (
             <Button
             disabled={isLoading}
             size={'sm'}
             onClick={handleDeletePlanFromCalendar}
             className="bg-red-500 hover:bg-red-600 text-foreground "
             >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                <Trash className="w-4 h-4 mr-1" />

                {`Delete from Calendar`}
              </>
              )}
          </Button>
              )}
          <Button size={'sm'} disabled={isLoading} onClick={handleClick}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// import { cn } from "@/lib/utils";
// import { Button } from "./ui/button";
// import { FitnessPlan } from "@/interfaces";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "./ui/dialog";
// import { addPlanToGoogleCalendar } from "@/lib/api-service";
// import { handleApiError } from "@/lib/error-handler";
// import { useEffect, useState } from "react";
// import { Loader2 } from "lucide-react";
// import { useData } from "@/context/data-context";
// import { toast } from "sonner";
// import { useAuth } from "@/context/auth-context";

// const Calender = ({ className }: { className?: string }) => (
//   <div className={cn(className, "")}>
//     <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
//       <rect width="22" height="22" x="13" y="13" fill="#fff"></rect>
//       <polygon
//         fill="#1e88e5"
//         points="25.68,20.92 26.688,22.36 28.272,21.208 28.272,29.56 30,29.56 30,18.616 28.56,18.616"
//       ></polygon>
//       <path
//         fill="#1e88e5"
//         d="M22.943,23.745c0.625-0.574,1.013-1.37,1.013-2.249c0-1.747-1.533-3.168-3.417-3.168 c-1.602,0-2.972,1.009-3.33,2.453l1.657,0.421c0.165-0.664,0.868-1.146,1.673-1.146c0.942,0,1.709,0.646,1.709,1.44 c0,0.794-0.767,1.44-1.709,1.44h-0.997v1.728h0.997c1.081,0,1.993,0.751,1.993,1.64c0,0.904-0.866,1.64-1.931,1.64 c-0.962,0-1.784-0.61-1.914-1.418L17,26.802c0.262,1.636,1.81,2.87,3.6,2.87c2.007,0,3.64-1.511,3.64-3.368 C24.24,25.281,23.736,24.363,22.943,23.745z"
//       ></path>
//       <polygon
//         fill="#fbc02d"
//         points="34,42 14,42 13,38 14,34 34,34 35,38"
//       ></polygon>
//       <polygon
//         fill="#4caf50"
//         points="38,35 42,34 42,14 38,13 34,14 34,34"
//       ></polygon>
//       <path
//         fill="#1e88e5"
//         d="M34,14l1-4l-1-4H9C7.343,6,6,7.343,6,9v25l4,1l4-1V14H34z"
//       ></path>
//       <polygon fill="#e53935" points="34,34 34,42 42,34"></polygon>
//       <path fill="#1565c0" d="M39,6h-5v8h8V9C42,7.343,40.657,6,39,6z"></path>
//       <path fill="#1565c0" d="M9,42h5v-8H6v5C6,40.657,7.343,42,9,42z"></path>
//     </svg>
//   </div>
// );

// export default function PlanToCalendar({
//   plan,
//   className,
// }: {
//   plan: FitnessPlan;
//   className?: string;
// }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedType, setSelectedType] = useState<
//     "all" | "workout" | "nutrition"
//   >("all");
//   const { settings } = useData();
//   const { refreshUser } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     if (plan.nutrition_added_to_calendar && !plan.workout_added_to_calendar)
//       setSelectedType("workout");
//     if (plan.workout_added_to_calendar && !plan.nutrition_added_to_calendar)
//       setSelectedType("nutrition");
//   }, []);

//   const handleClick = async () => {
//     try {
//       setIsLoading(true);
//       await addPlanToGoogleCalendar(plan.id, selectedType);
//       toast.success(
//         `${
//           selectedType === "all"
//             ? "Plan"
//             : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
//         } successfully added to Google Calendar`
//       );
//       setIsOpen(false);
//       await refreshUser();
//     } catch (e) {
//       handleApiError(e, "Failed to add to Google Calendar");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const buttonName = plan.workout_added_to_calendar
//     ? plan.nutrition_added_to_calendar
//       ? ""
//       : "Add Nutrition to Calender"
//     : plan.nutrition_added_to_calendar
//     ? "Add Workout to Goole Calender"
//     : "Add Plan to Google Calender";

//   if (
//     !settings.connectedToGoogleAccount ||
//     (plan.workout_added_to_calendar && plan.nutrition_added_to_calendar)
//   ) {
//     return null;
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
//       <DialogTrigger asChild>
//         <Button
//           onClick={() => {}}
//           className={cn(className, "glass text-foreground")}
//         >
//           <Calender /> {buttonName}
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="glass">
//         <DialogHeader>
//           <DialogTitle className="flex gap-3">
//             <Calender className="h-5 w-5" />
//             Add Plan to Google Calender
//           </DialogTitle>
//           <DialogDescription className="text-xs">
//             Please take not that this is a long running task so it might take a
//             while to reflect.
//           </DialogDescription>
//         </DialogHeader>
//         <div className="flex flex-col gap-6">
//           <div>Select what to add:</div>
//           <div className="flex justify-around">
//             {["all", "workout", "nutrition"].map((t) => (
//               <Button
//                 disabled={
//                   (t === "workout" && plan.workout_added_to_calendar) ||
//                   (t === "nutrition" && plan.nutrition_added_to_calendar) ||
//                   (t === "all" &&
//                     (plan.workout_added_to_calendar ||
//                       plan.nutrition_added_to_calendar))
//                 }
//                 onClick={() =>
//                   setSelectedType(t as "all" | "workout" | "nutrition")
//                 }
//                 className={`text-foreground p-2 rounded-lg border 
//                                 ${
//                                   selectedType === t
//                                     ? "border-primary-500 bg-primary-700 font-bold"
//                                     : "glass"
//                                 }                                
//                                 `}
//               >
//                 {t.charAt(0).toUpperCase() + t.slice(1)}
//               </Button>
//             ))}
//           </div>
//         </div>
//         <DialogFooter>
//           <DialogClose asChild>
//             <Button
//               disabled={isLoading}
//               className="bg-transparent text-foreground"
//             >
//               Cancel
//             </Button>
//           </DialogClose>
//           <Button disabled={isLoading} onClick={handleClick}>
//             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
