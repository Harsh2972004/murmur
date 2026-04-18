"use client";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signInSchema } from "@/schemas/signInSchema";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";

const SignIn = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const response = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });

    if (response?.error) {
      if (response.error === "CredentialsSignin") {
        toast.error("Login failed", {
          description: "Incorrect username or password",
        });
      } else {
        toast.error(" Error", {
          description: response.error,
        });
      }
    }

    if (response?.url) {
      router.replace("/dashboard");
    }
  };
  return (
    <div className="min-h-screen flex flex-col gap-10 px-4 md:p-0 items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-100 dark:bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight lg:text-4xl mb-6">
            Sign in to Mystery Message
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet>
            <FieldGroup>
              <Controller
                name="identifier"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="identifier">
                      Username / Email
                    </FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Enter your username or email"
                      id="identifier"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Enter your password"
                      id="password"
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <Button type="submit" variant="default" className="w-full">
            Sign In
          </Button>
        </form>
        <div className="text-center mt-4 space-y-4">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-blue-500 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
          <p className="underline text-blue-500">
            <Link href="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
