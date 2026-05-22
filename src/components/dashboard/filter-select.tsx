import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  placeholder: string;

  value: string;

  onChange: (value: string) => void;

  options: {
    label: string;
    value: string;
  }[];
}

export const FilterSelect = ({
  placeholder,
  value,
  onChange,
  options,
}: Props) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="h-11 min-w-[180px] rounded-2xl border-border bg-background shadow-none">
        
        <SelectValue
          placeholder={placeholder}
        />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};