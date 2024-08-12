import { Clipboard, ClipboardCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { truncateString } from "@/lib/utils";
import { useState } from "react";

export type ObjectWithMatchingProperties<T> = Record<string, T>;
interface SuccessDialogProps {
  title: string;
  description: string;
  data: ObjectWithMatchingProperties<string>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function SuccessDialog({
  title,
  description,
  data,
  open,
  setOpen,
}: SuccessDialogProps) {
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  const handleClick = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState((prev) => ({
        ...prev,
        [key]: true,
      }));

      // Reset the copied state after a delay to show the checkmark
      setTimeout(() => {
        setCopiedState((prev) => ({
          ...prev,
          [key]: false,
        }));
      }, 2000); // Duration to show the checkmark icon
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {Object.keys(data).map((key) => (
          <div className="flex flex-nowrap gap-2 items-center" key={key}>
            <p>{key}:</p>
            <p className="text-sm text-muted-foreground">
              {truncateString(data[key], 4, 4)}
            </p>
            {copiedState[key] ? (
              <ClipboardCheck className="h-[16px] w-[16px]" />
            ) : (
              <Clipboard
                className="h-[16px] w-[16px] cursor-pointer"
                onClick={() => handleClick(key, data[key])}
              />
            )}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
