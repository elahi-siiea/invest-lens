"use client";

import { Button } from "@/components/ui/Button";
import { StateMessage } from "@/components/ui/StateMessage";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <StateMessage
      tone="error"
      title="Something went wrong"
      action={
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      }
    >
      The page hit an unexpected error. Your saved settings are untouched. Try again, and reload the page if it keeps
      happening.
    </StateMessage>
  );
}
