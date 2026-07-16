import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

interface Props {
  reactComponent: React.ReactNode;
  setActiveTab: (tab: string) => void;
  tab: string;
}

const RailItem = ({ reactComponent, setActiveTab, tab }: Props) => {
  const pathname = usePathname();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link onClick={() => setActiveTab(tab)} href={`/dashboard/${tab}`}>
          <Button
            className={`rounded-full ${pathname.includes(tab) ? "text-foreground" : "text-muted-foreground"}`}
            variant={"outline"}
            size={"icon"}
          >
            {reactComponent}
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </TooltipContent>
    </Tooltip>
  );
};

export default RailItem;
