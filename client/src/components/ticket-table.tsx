import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Eye, CheckCircle, Clock } from "lucide-react";
import { type Ticket } from "@shared/schema";
import StatusUpdateModal from "./status-update-modal";

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
}

export default function TicketTable({ tickets, isLoading }: TicketTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "resolved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No tickets found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-gray-200 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Support Tickets</CardTitle>
        </CardHeader>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Taken</TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solved By</TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap text-sm text-gray-900">
                    {ticket.date}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-900">
                    {ticket.room}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 max-w-xs truncate">
                    {ticket.issue}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {ticket.actionTaken || "No action taken yet"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-900">
                    {ticket.solvedBy || "Unassigned"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClick(ticket)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{ticket.room}</h4>
                  <p className="text-xs text-gray-500">{ticket.date}</p>
                </div>
                {getStatusBadge(ticket.status)}
              </div>
              <p className="text-sm text-gray-900 mb-2">{ticket.issue}</p>
              <p className="text-xs text-gray-600 mb-2">
                Action: {ticket.actionTaken || "No action taken yet"}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Solved by: {ticket.solvedBy || "Unassigned"}
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditClick(ticket)}
                  className="text-primary hover:text-blue-700"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <StatusUpdateModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
      />
    </>
  );
}
