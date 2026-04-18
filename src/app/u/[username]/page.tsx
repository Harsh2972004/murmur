"use client";
import React, { use, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";

const SendMessage = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] =
    useState<boolean>(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
      username: username,
    },
  });

  const fetchSuggestions = async () => {
    setIsFetchingSuggestions(true);
    setSuggestions([]);

    try {
      const response = await axios.post<string>(
        "/api/suggest-messages",
        {},
        { responseType: "text" },
      );

      const parsed = response.data
        .split("||")
        .map((q: string) => q.trim())
        .filter(Boolean);

      setSuggestions(parsed);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message ?? "Failed to fetch suggestions";
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);

    try {
      const response = await axios.post<ApiResponse>("/api/send-message", data);
      toast.success("Success", {
        description: response.data?.message,
      });
    } catch (error) {
      console.log("error sending message ", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast.error("Cannot Send", {
        description: errorMessage,
      });
    } finally {
      setIsSending(false);
      form.reset(
        { username: username, content: "" },
        { keepErrors: false, keepTouched: false, keepDirty: false },
      );
    }
  };
  return (
    <main className="flex flex-col w-full items-center justify-center h-screen px-4 max-w-6xl mx-auto gap-20">
      <h1 className="text-4xl font-semibold">Public Profile Link</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldSet>
          <FieldGroup>
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel className="text-lg" htmlFor="content">
                    Send anonymous message to @{username}
                  </FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={!!fieldState.error}
                    id="content"
                    placeholder="Write your message here"
                    className="h-30 max-h-50"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
        <Button
          type="submit"
          disabled={isSending}
          className="w-fit font-semibold p-6 "
        >
          {isSending ? "Sending..." : "Send Message"}
        </Button>
      </form>
      {/* Suggestions section */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-4">
          <p className="text-lg font-medium">Suggest Messages</p>
          <Button
            type="button"
            variant="outline"
            onClick={fetchSuggestions}
            disabled={isFetchingSuggestions}
          >
            {isFetchingSuggestions ? "Generating..." : "Suggest"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Click a suggestion to use it as your message
        </p>
        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => form.setValue("content", suggestion)}
              className="text-left border rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>{" "}
    </main>
  );
};

export default SendMessage;
