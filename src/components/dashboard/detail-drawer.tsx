import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  children: React.ReactNode;
}

export const DetailDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}: Props) => {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        className="w-full border-l border-border bg-background sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          
          <SheetTitle className="text-2xl font-bold">
            {title}
          </SheetTitle>

          {description && (
            <SheetDescription>
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-8">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};