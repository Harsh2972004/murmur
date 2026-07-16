import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../ui/field";
import { TabsContent } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, UserSearch } from "lucide-react";
import { useState } from "react";
import {
  AddFriendInput,
  SendFriendRequestSchema,
} from "@/schemas/sendFriendRequestSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "sonner";

const AddFriend = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<AddFriendInput>({
    resolver: zodResolver(SendFriendRequestSchema),
    defaultValues: {
      friendName: "",
    },
  });

  const onSubmit = async (data: AddFriendInput) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(
        "/api/users/friends/request",
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
      form.reset({ friendName: "" });
    }
  };

  return (
    <TabsContent className="w-full space-y-4" value="add-friend">
      <div className="flex items-center gap-2 px-0 py-4 border-b shrink-0">
        <UserSearch />
        <h1 className="text-lg md:text-xl font-semibold text-center">
          Add Friend
        </h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
        <FieldSet>
          <FieldGroup>
            <Controller
              name="friendName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="friendName">
                    Who would you like to add as your friend?
                  </FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    id="friendName"
                    placeholder="Enter a username"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
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
            "Send Friend request"
          )}
        </Button>
      </form>
    </TabsContent>
  );
};

export default AddFriend;
