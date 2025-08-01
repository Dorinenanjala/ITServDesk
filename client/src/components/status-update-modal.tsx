import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Ticket } from "@shared/schema";
import { X } from "lucide-react";

interface StatusUpdateModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StatusUpdateModal({ ticket, isOpen, onClose }: StatusUpdateModalProps) {
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string; actionTaken?: string }) => {
      if (!ticket) throw new Error("No ticket selected");
      return apiRequest("PATCH", `/api/tickets/${ticket.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    const updateData: { status: string; actionTaken?: string } = { status };
    if (notes.trim()) {
      const existingAction = ticket?.actionTaken || "";
      updateData.actionTaken = existingAction 
        ? `${existingAction}\n\nUpdate: ${notes.trim()}`
        : notes.trim();
    }

    updateMutation.mutate(updateData);
  };

  // Reset form when modal opens with new ticket
  const handleOpenChange = (open: boolean) => {
    if (open && ticket) {
      setStatus(ticket.status);
      setNotes("");
    } else if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">
              Update Ticket Status
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {ticket && (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Ticket: <span className="font-medium">{ticket.room} - {ticket.issue}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Add any additional notes about the status change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={updateMutation.isPending || !status}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
