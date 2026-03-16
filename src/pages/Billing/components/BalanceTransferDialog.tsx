import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Users, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BalanceTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEAMS = [
  { id: "1", name: "Marketing Team", balance: 500.0 },
  { id: "2", name: "Sales Team", balance: 1250.0 },
  { id: "3", name: "Technical Support", balance: 300.0 },
  { id: "4", name: "Product Development", balance: 2100.0 },
];

export function BalanceTransferDialog({
  open,
  onOpenChange,
}: BalanceTransferDialogProps) {
  const [fromTeam, setFromTeam] = React.useState<string>("");
  const [toTeam, setToTeam] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedFromTeam = TEAMS.find((t) => t.id === fromTeam);
  const selectedToTeam = TEAMS.find((t) => t.id === toTeam);

  const handleTransfer = () => {
    if (!fromTeam || !toTeam || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (fromTeam === toTeam) {
      toast.error("Source and destination teams must be different");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (selectedFromTeam && transferAmount > selectedFromTeam.balance) {
      toast.error("Insufficient balance in source team");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        `Successfully transferred EGP ${transferAmount.toLocaleString()} from ${
          selectedFromTeam?.name
        } to ${selectedToTeam?.name}`
      );
      onOpenChange(false);
      // Reset form
      setFromTeam("");
      setToTeam("");
      setAmount("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-primary" />
            Balance transfer
          </DialogTitle>
          <DialogDescription>
            Easily transfer balance between your teams.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-4">
            {/* From Team */}
            <div className="space-y-2">
              <Label htmlFor="fromTeam">From Team</Label>
              <Select value={fromTeam} onValueChange={setFromTeam}>
                <SelectTrigger id="fromTeam" className="h-10 w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span className="truncate">{team.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">EGP {team.balance.toLocaleString()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="min-h-[16px]">
                {selectedFromTeam && (
                  <div className="flex items-center gap-1.5 px-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Wallet className="size-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      Available: <span className="font-medium text-foreground">EGP {selectedFromTeam.balance.toLocaleString()}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
               <div className="bg-background rounded-full p-1 border shadow-sm">
                  <ArrowRightLeft className="size-4 text-muted-foreground rotate-90" />
               </div>
            </div>

            {/* To Team */}
            <div className="space-y-2">
              <Label htmlFor="toTeam">To Team</Label>
              <Select value={toTeam} onValueChange={setToTeam}>
                <SelectTrigger id="toTeam" className="h-10 w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.filter(t => t.id !== fromTeam).map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span className="truncate">{team.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">EGP {team.balance.toLocaleString()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="transferAmount">Amount to transfer</Label>
            <Input
              id="transferAmount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11"
            />
            {selectedFromTeam && amount && parseFloat(amount) > selectedFromTeam.balance && (
                <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium px-0.5">
                    <AlertCircle className="size-3" />
                    Amount exceeds available balance
                </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            onClick={handleTransfer}
            disabled={isLoading || !fromTeam || !toTeam || !amount || (selectedFromTeam && parseFloat(amount) > selectedFromTeam.balance)}
          >
            {isLoading ? "Transferring..." : "Transfer Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
