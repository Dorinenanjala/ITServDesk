import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Ticket } from "@shared/schema";
import StatsCards from "@/components/stats-cards";
import TicketFilters from "@/components/ticket-filters";
import TicketTable from "@/components/ticket-table";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const { toast } = useToast();

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = searchTerm === "" || 
        ticket.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.solvedBy && ticket.solvedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesRoom = roomFilter === "all" || ticket.room === roomFilter;

      return matchesSearch && matchesStatus && matchesRoom;
    });
  }, [tickets, searchTerm, statusFilter, roomFilter]);

  const handleExport = () => {
    try {
      const csvContent = [
        ["Date", "Room", "Issue", "Action Taken", "Solved By", "Status"].join(","),
        ...filteredTickets.map(ticket => [
          ticket.date,
          `"${ticket.room}"`,
          `"${ticket.issue}"`,
          `"${ticket.actionTaken || ""}"`,
          `"${ticket.solvedBy || ""}"`,
          ticket.status
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Tickets have been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export tickets",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <StatsCards />
      
      <TicketFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roomFilter={roomFilter}
        setRoomFilter={setRoomFilter}
        onExport={handleExport}
      />

      <TicketTable tickets={filteredTickets} isLoading={isLoading} />
    </div>
  );
}
