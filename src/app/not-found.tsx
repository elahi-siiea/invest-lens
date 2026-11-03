import Link from "next/link";
import { StateMessage } from "@/components/ui/StateMessage";

export default function NotFound() {
  return (
    <StateMessage
      tone="empty"
      title="That page does not exist"
      action={
        <>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-medium text-on-accent">
            Compare investments
          </Link>
          <Link href="/simulator" className="inline-flex min-h-11 items-center rounded-control border border-edge px-4 text-sm font-medium">
            Investing simulator
          </Link>
        </>
      }
    >
      Check the address, or pick one of the two tools.
    </StateMessage>
  );
}
