"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerTime({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date: Date) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (selectedDate?: Date) => {
    if (!selectedDate) return;

    if (value) {
      selectedDate.setHours(value.getHours());
      selectedDate.setMinutes(value.getMinutes());
      selectedDate.setSeconds(value.getSeconds());
    }

    onChange(selectedDate);
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) return;

    const [hours, minutes, seconds] = e.target.value.split(":").map(Number);

    const newDate = new Date(value);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds || 0);

    onChange(newDate);
  };

  return (
    <FieldGroup className="flex-row">
      <Field>
        <FieldLabel>Expiry Date</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-32 justify-between font-normal"
            >
              {value ? format(value, "PPP") : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </Field>

      <Field className="w-32">
        <FieldLabel>Time</FieldLabel>
        <Input
          type="time"
          step="1"
          value={
            value
              ? `${String(value.getHours()).padStart(2, "0")}:${String(
                  value.getMinutes(),
                ).padStart(
                  2,
                  "0",
                )}:${String(value.getSeconds()).padStart(2, "0")}`
              : ""
          }
          onChange={handleTimeChange}
        />
      </Field>
    </FieldGroup>
  );
}
