"use client";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema } from "@/schemas/forgotPasswordSchema";

const ForgotPassword = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/forget-password`, {
        email: data.email,
      });

      toast.success(response.data.message);
      router.replace(`/reset-password/${response.data.username}`);
    } catch (error) {
      console.log("error sending email", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;

      toast.error("Error sending email", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight lg:text-5xl mb-6">
            Forgot Password
          </h1>
          <p className="mb-4">
            Enter the email which is linked to the account.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
          <FieldSet>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="code">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Enter your email"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Button type="submit" variant="default" className="w-full">
            submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
