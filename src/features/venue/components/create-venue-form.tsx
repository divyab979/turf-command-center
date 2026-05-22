import { useState } from "react";

import { useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { Button }
  from "@/components/ui/button";

import { Input }
  from "@/components/ui/input";

import { Label }
  from "@/components/ui/label";

import {
  createVenue,
} from "../services/venue-service";

interface Props {
  onSuccess?: () => void;
}

export const CreateVenueForm = ({
  onSuccess,
}: Props) => {

  const queryClient =
    useQueryClient();

  const [name, setName] =
    useState("");

  const [location, setLocation] =
    useState("");

  const mutation =
    useMutation({
      mutationFn: createVenue,

      onSuccess: async () => {

        await queryClient.invalidateQueries({
          queryKey: ["venues"],
        });

        setName("");
        setLocation("");

        onSuccess?.();
      },
    });

  return (
    <div className="space-y-6">

      <div>
        <Label>
          Venue Name
        </Label>

        <Input
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          placeholder="GameUp Arena"
          className="mt-2"
        />
      </div>

      <div>
        <Label>
          Location
        </Label>

        <Input
          value={location}
          onChange={(e) =>
            setLocation(
              e.target.value
            )
          }
          placeholder="Mumbai"
          className="mt-2"
        />
      </div>

      <Button
        className="w-full rounded-2xl"
        disabled={
          mutation.isPending
        }
        onClick={() => {
          mutation.mutate({
            name,
            location,
          });
        }}
      >
        {mutation.isPending
          ? "Creating..."
          : "Create Venue"}
      </Button>

    </div>
  );
};