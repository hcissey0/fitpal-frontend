

"use client";
import { ProgressCalendar } from "@/components/progress-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useData } from "@/context/data-context";
import CalorieTrackingRadial from "@/components/calorie-tracking-radial";
import MacronutrientBreakdown from "@/components/macro-nutrient-breakdown";
import WeeklyWorkoutCompletion from "@/components/weekly-workout-completion";

export default function ProgressPage() {
  const { progress } = useData();

  return (
    <div className="space-y-4 lg:min-w-100">
      <h1 className="text-4xl font-bold bg-clip-text bg-gradient-to-r from-pink-500 to-teal-500">Your Progress</h1>
      <div className="flex flex-col gap-4 ">

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  <ProgressCalendar className="sm:col-span-3 md:col-span-4" />
                  <CalorieTrackingRadial className="sm:col-span-2" />
                  <MacronutrientBreakdown className="sm:col-span-2" />
                  <WeeklyWorkoutCompletion className="sm:col-span-2 md:col-span-4 lg:col-span-4" />
                </div>
      <div className={"glass p-4 rounded-xl flex flex-col gap-4"}>
        <CardTitle>Progress Over Time</CardTitle>
          <ResponsiveContainer width="100%" height={300} >
            <LineChart data={progress}>
              <CartesianGrid stroke="" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="workout_progress"
                stroke="#ff6b6b"
              />
              <Line
                type="monotone"
                dataKey="nutrition_progress"
                stroke="#4caf50"
                />
                <Line
                  type="monotone"
                  dataKey="water_progress"
                  stroke="#00d4ff"
                />
            </LineChart>
          </ResponsiveContainer>

      </div>
                </div>
    </div>
  );
}
