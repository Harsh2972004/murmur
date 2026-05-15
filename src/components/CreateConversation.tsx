"use client";
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "./ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import {
  AnonymousChatFormInput,
  anonymousChatFormSchema,
} from "@/schemas/conversationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";
import { DatePickerTime } from "./ui/time-picker";

const CreateConversation = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<AnonymousChatFormInput>({
    resolver: zodResolver(anonymousChatFormSchema),
    defaultValues: {
      name: "",
      expiresAt: undefined,
    },
  });

  const onSubmit = async (data: AnonymousChatFormInput) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/conversations/create",
        data,
      );

      toast.success("Success", {
        description: response.data.message,
      });
    } catch (error) {
      console.log("error signing up user", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;

      toast.error("SignUp Failed", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="rounded-full text-muted-foreground"
          variant={"outline"}
          size={"icon-lg"}
          onClick={() => setOpen(true)}
        >
          <Plus />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Create a conversation</AlertDialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
          <FieldSet>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      id="name"
                      placeholder="Enter chat name"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name="expiresAt"
                control={form.control}
                render={({ field }) => (
                  <DatePickerTime
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => field.onChange(date.toISOString())}
                  />
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className=""
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateConversation;
