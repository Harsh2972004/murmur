import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

interface Props {
  reactComponent: React.ReactNode;
  setActiveTab: (tab: string) => void;
  tab: string;
  hasUnread?: boolean;
}

const RailItem = ({ reactComponent, setActiveTab, tab, hasUnread }: Props) => {
  const pathname = usePathname();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link onClick={() => setActiveTab(tab)} href={`/dashboard/${tab}`}>
          <div className="relative">
            <Button
              className={`rounded-full ${pathname.includes(tab) ? "text-foreground" : "text-muted-foreground"}`}
              variant={"outline"}
              size={"icon"}
            >
              {reactComponent}
            </Button>
            {hasUnread && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
            )}
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </TooltipContent>
    </Tooltip>
  );
};

export default RailItem;
