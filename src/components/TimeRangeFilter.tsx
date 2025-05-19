
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface TimeRangeFilterProps {
  onFilterChange: (range: string) => void;
}

const TimeRangeFilter = ({ onFilterChange }: TimeRangeFilterProps) => {
  const [activeFilter, setActiveFilter] = useState("week");
  
  const handleFilterChange = (range: string) => {
    setActiveFilter(range);
    onFilterChange(range);
  };
  
  return (
    <div className="flex items-center">
      <Button 
        size="sm" 
        variant={activeFilter === "week" ? "default" : "outline"}
        onClick={() => handleFilterChange("week")}
        className="rounded-r-none"
      >
        <Calendar className="h-4 w-4 mr-1" />
        Week
      </Button>
      <Button 
        size="sm" 
        variant={activeFilter === "month" ? "default" : "outline"}
        onClick={() => handleFilterChange("month")}
        className="rounded-none border-l-0"
      >
        <Calendar className="h-4 w-4 mr-1" />
        Month
      </Button>
      <Button 
        size="sm" 
        variant={activeFilter === "all" ? "default" : "outline"}
        onClick={() => handleFilterChange("all")}
        className="rounded-l-none border-l-0"
      >
        <Calendar className="h-4 w-4 mr-1" />
        All Time
      </Button>
    </div>
  );
};

export default TimeRangeFilter;
