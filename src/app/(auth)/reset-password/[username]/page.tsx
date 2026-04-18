"use client";
import { useParams, useRouter } from "next/navigation";
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
import { resetPasswordSchema } from "@/schemas/resetPasswordSchema";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/reset-password`, {
        username: params.username,
        code: data.code,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      toast.success(response.data.message);
      router.replace("/sign-in");
    } catch (error) {
      console.log("error resetting password", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;

      toast.error("Password reset failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight lg:text-5xl mb-6">
            Reset Your Password
          </h1>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
          <FieldSet>
            <FieldGroup>
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="code">Verification code</FieldLabel>
                    <Input
                      {...field}
                      id="code"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Enter your verification code"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="code">New Password</FieldLabel>
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Enter your new password"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="code">Confirm Password</FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Confirm Password"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Button type="submit" variant="default" className="w-full">
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
