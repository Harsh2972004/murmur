"use client";

import React, { use, useEffect, useState } from "react";
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

const ConversationSendPage = ({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) => {
  const { conversationId } = use(params);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] =
    useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    const validateConversation = async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const response = await axios.get<ApiResponse>(
          `/api/conversations/${conversationId}/validate`,
        );

        if (response.data.success) {
          setIsAllowed(true);
          return;
        }

        setValidationError(
          response.data.message ??
            "Unable to validate this anonymous conversation.",
        );
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setValidationError(
          axiosError.response?.data?.message ||
            "Unable to validate this anonymous conversation.",
        );
      } finally {
        setIsValidating(false);
      }
    };

    validateConversation();
  }, [conversationId]);

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
      const axiosError = error as AxiosError<any>;
      let errorMessage = "Failed to fetch suggestions";

      const respData = axiosError.response?.data;
      if (respData) {
        if (typeof respData === "string") {
          try {
            const parsed = JSON.parse(respData);
            errorMessage = parsed?.message ?? errorMessage;
          } catch {
            // not JSON, keep default
          }
        } else if (typeof respData === "object") {
          errorMessage = respData?.message ?? errorMessage;
        }
      }

      toast.error("Error", { description: errorMessage });
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);

    try {
      const response = await axios.post<ApiResponse>(
        `/api/conversations/${conversationId}/messages`,
        data,
      );

      toast.success("Success", {
        description: response.data?.message,
      });
    } catch (error) {
      console.error("error sending message ", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast.error("Cannot Send", {
        description: errorMessage,
      });
    } finally {
      setIsSending(false);
      form.reset(
        { content: "" },
        { keepErrors: false, keepTouched: false, keepDirty: false },
      );
    }
  };

  if (isValidating) {
    return (
      <main className="flex flex-col w-full items-center justify-center h-screen px-4 max-w-6xl mx-auto gap-6">
        <h1 className="text-3xl font-semibold">
          Preparing anonymous conversation
        </h1>
        <p className="text-sm text-muted-foreground">
          Checking the conversation status before sending your message.
        </p>
      </main>
    );
  }

  if (!isAllowed) {
    return (
      <main className="flex flex-col w-full items-center justify-center h-screen px-4 max-w-6xl mx-auto gap-6 text-center">
        <h1 className="text-3xl font-semibold">
          Unable to send anonymous message
        </h1>
        <p className="text-sm text-muted-foreground">{validationError}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full items-center justify-center h-screen px-4 max-w-6xl mx-auto gap-20">
      <h1 className="text-4xl font-semibold">Send anonymous message</h1>
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
                    Write your anonymous message
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
          className="w-fit font-semibold p-6"
        >
          {isSending ? "Sending..." : "Send Message"}
        </Button>
      </form>

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
      </div>
    </main>
  );
};

export default ConversationSendPage;
