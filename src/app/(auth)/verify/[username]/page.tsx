"use client";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });

      toast.success(response.data.message);
      router.replace("/sign-in");
    } catch (error) {
      console.log("error in signing up  of user", error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;

      toast.error("SignUp Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight lg:text-5xl mb-6">
            Verify your account
          </h1>
          <p className="mb-4">Enter the verifcation code sent to your email</p>
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
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Button type="submit" variant="default" className="w-full">
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
