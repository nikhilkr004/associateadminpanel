import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWithdrawalRequests,
    approveWithdrawalRequest,
    completeWithdrawalRequest,
    rejectWithdrawalRequest,
    WithdrawalRequest
} from '@/services/firestoreService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    IndianRupee,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Search,
    Filter,
    Eye,
    FileText,
    CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const Withdrawals: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth(); // Admin user
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

    // Action Modals State
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    // Form States
    const [transactionId, setTransactionId] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [paymentMode, setPaymentMode] = useState('NEFT');
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch Requests
    const { data: requests, isLoading } = useQuery({
        queryKey: ['withdrawalRequests'],
        queryFn: getWithdrawalRequests
    });

    // Mutations
    const approveMutation = useMutation({
        mutationFn: ({ id, adminId }: { id: string, adminId: string }) =>
            approveWithdrawalRequest(id, adminId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
            toast({ title: "Success", description: "Withdrawal request approved." });
            setIsApproveOpen(false);
            setIsDetailOpen(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: `Failed to approve: ${error}`, variant: "destructive" });
        }
    });

    const completeMutation = useMutation({
        mutationFn: ({ id, advisorId, amount, details }: { id: string, advisorId: string, amount: number, details: any }) =>
            completeWithdrawalRequest(id, advisorId, amount, details),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
            toast({ title: "Success", description: "Withdrawal request marked as completed." });
            setIsCompleteOpen(false);
            setIsDetailOpen(false);
            resetForms();
        },
        onError: (error) => {
            toast({ title: "Error", description: `Failed to complete: ${error}`, variant: "destructive" });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, advisorId, amount, reason }: { id: string, advisorId: string, amount: number, reason: string }) =>
            rejectWithdrawalRequest(id, advisorId, amount, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
            toast({ title: "Success", description: "Withdrawal request rejected and refunded." });
            setIsRejectOpen(false);
            setIsDetailOpen(false);
            resetForms();
        },
        onError: (error) => {
            toast({ title: "Error", description: `Failed to reject: ${error}`, variant: "destructive" });
        }
    });

    const resetForms = () => {
        setTransactionId('');
        setUtrNumber('');
        setPaymentMode('NEFT');
        setAdminNotes('');
        setRejectionReason('');
    };

    // Filter Logic
    const filterRequests = (statusFilter: string[]) => {
        if (!requests) return [];
        return requests.filter(req => {
            const matchesSearch = req.advisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.advisorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id.includes(searchTerm);
            const matchesStatus = statusFilter.includes(req.status);
            return matchesSearch && matchesStatus;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'PROCESSING': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleAction = (request: WithdrawalRequest, action: 'detail' | 'approve' | 'complete' | 'reject') => {
        setSelectedRequest(request);
        if (action === 'detail') setIsDetailOpen(true);
        if (action === 'approve') setIsApproveOpen(true);
        if (action === 'complete') setIsCompleteOpen(true);
        if (action === 'reject') setIsRejectOpen(true);
    };

    const handleApprove = () => {
        if (!selectedRequest) return;

        const adminId = user?.uid;
        if (!adminId) {
            console.error("Approval failed: No Admin ID found (user not authenticated?)");
            toast({
                title: "Authentication Error",
                description: "You must be logged in as an admin to approve requests.",
                variant: "destructive"
            });
            return;
        }

        console.log(`Approving request ${selectedRequest.id} by admin ${adminId}`);
        approveMutation.mutate({ id: selectedRequest.id, adminId });
    };

    const handleComplete = () => {
        if (!selectedRequest || !transactionId || !utrNumber) {
            toast({ title: "Error", description: "Transaction details required", variant: "destructive" });
            return;
        }
        completeMutation.mutate({
            id: selectedRequest.id,
            advisorId: selectedRequest.advisorId,
            amount: selectedRequest.requestedAmount,
            details: { transactionId, utrNumber, paymentMode, adminNotes }
        });
    };

    const handleReject = () => {
        if (!selectedRequest || !rejectionReason) {
            toast({ title: "Error", description: "Rejection reason required", variant: "destructive" });
            return;
        }
        rejectMutation.mutate({
            id: selectedRequest.id,
            advisorId: selectedRequest.advisorId,
            amount: selectedRequest.requestedAmount,
            reason: rejectionReason
        });
    };

    const RequestsTable = ({ data }: { data: WithdrawalRequest[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Advisor</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Net Payable</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((req) => (
                    <TableRow
                        key={req.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleAction(req, 'detail')}
                    >
                        <TableCell className="font-medium">
                            {req.requestedAt?.seconds ? format(new Date(req.requestedAt.seconds * 1000), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-semibold">{req.advisorName}</span>
                                <span className="text-xs text-muted-foreground">{req.advisorEmail}</span>
                            </div>
                        </TableCell>
                        <TableCell>₹{req.requestedAmount}</TableCell>
                        <TableCell>
                            <span className="font-bold text-green-600">₹{req.netPayableAmount}</span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col text-sm">
                                <span>{req.bankName}</span>
                                <span className="text-xs text-muted-foreground">AG: {req.bankAccountNumber}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={getStatusColor(req.status)}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleAction(req, 'detail')}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {data.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No requests found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    if (isLoading) return <div className="p-10 text-center">Loading withdrawals...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Withdrawals</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage advisor payouts and financial requests</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-card border-border/50"
                    />
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-4 bg-muted/30 p-1">
                    <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Clock className="w-4 h-4" /> Pending
                    </TabsTrigger>
                    <TabsTrigger value="processing" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Filter className="w-4 h-4" /> Processing
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <FileText className="w-4 h-4" /> History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <Card className="border-border/40 rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <RequestsTable data={filterRequests(['PENDING'])} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processing">
                    <Card className="border-border/40 rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <RequestsTable data={filterRequests(['APPROVED', 'PROCESSING'])} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="border-border/40 rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <RequestsTable data={filterRequests(['COMPLETED', 'REJECTED', 'CANCELLED'])} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Withdrawal Request Details</DialogTitle>
                        <DialogDescription>Request ID: {selectedRequest?.id}</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Advisor Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bank Details</h3>
                                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                                    <div className="grid grid-cols-3"><span className="text-muted-foreground">Account Name:</span> <span className="col-span-2 font-medium">{selectedRequest.bankAccountHolderName}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-muted-foreground">Bank Name:</span> <span className="col-span-2 font-medium">{selectedRequest.bankName}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-muted-foreground">Account No:</span> <span className="col-span-2 font-medium">{selectedRequest.bankAccountNumber}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-muted-foreground">IFSC Code:</span> <span className="col-span-2 font-medium">{selectedRequest.bankIfscCode}</span></div>
                                    <div className="grid grid-cols-3"><span className="text-muted-foreground">PAN:</span> <span className="col-span-2 font-medium">{selectedRequest.bankPanNumber}</span></div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Payout Breakdown</h3>
                                <div className="p-4 border rounded-lg space-y-3">
                                    <div className="flex justify-between"><span>Requested:</span> <span>₹{selectedRequest.requestedAmount}</span></div>
                                    <div className="flex justify-between text-muted-foreground text-sm"><span>Platform Fee (5%):</span> <span>- ₹{selectedRequest.platformFee}</span></div>
                                    <div className="flex justify-between text-muted-foreground text-sm"><span>GST on Fee (18%):</span> <span>- ₹{selectedRequest.gstOnFee}</span></div>
                                    {selectedRequest.tdsDeducted > 0 && <div className="flex justify-between text-muted-foreground text-sm"><span>TDS Deducted:</span> <span>- ₹{selectedRequest.tdsDeducted}</span></div>}
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg text-green-600">
                                        <span>Net Payable:</span>
                                        <span>₹{selectedRequest.netPayableAmount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Timeline or Info */}
                            <div className="md:col-span-2 border-t pt-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">Current Status:</span>
                                    <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                                </div>
                                {selectedRequest.adminNotes && <div className="mt-2 text-sm text-muted-foreground">Note: {selectedRequest.adminNotes}</div>}
                                {selectedRequest.rejectionReason && <div className="mt-2 text-sm text-destructive">Rejection Reason: {selectedRequest.rejectionReason}</div>}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {/* Dynamic Actions based on Status */}
                        {selectedRequest?.status === 'PENDING' && (
                            <>
                                <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>Reject</Button>
                                <Button onClick={() => handleApprove()} disabled={approveMutation.isPending}>
                                    {approveMutation.isPending ? 'Processing...' : 'Approve Request'}
                                </Button>
                            </>
                        )}
                        {selectedRequest?.status === 'APPROVED' && (
                            <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" onClick={() => setIsCompleteOpen(true)}>
                                Mark as Paid / Complete
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Complete/Pay Modal */}
            <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payout</DialogTitle>
                        <DialogDescription>Enter payment transaction details to mark this as completed.</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="bg-muted/50 p-4 rounded-lg my-4 text-sm space-y-3 border">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-muted-foreground">Beneficiary Name:</span>
                                <span className="font-medium">{selectedRequest.bankAccountHolderName}</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-muted-foreground">Bank & IFSC:</span>
                                <span className="font-medium">{selectedRequest.bankName} ({selectedRequest.bankIfscCode})</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-muted-foreground">Account Number:</span>
                                <span className="font-medium">{selectedRequest.bankAccountNumber}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <span className="font-semibold text-green-700">Net Payable Amount:</span>
                                <span className="font-bold text-lg text-green-700">₹{selectedRequest.netPayableAmount}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="txnId">Transaction Reference / UTR *</Label>
                            <Input id="txnId" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. TXN12345678" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="utr">Confirm UTR Number *</Label>
                            <Input id="utr" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} placeholder="Type UTR again to confirm" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label>Payment Mode</Label>
                            <Input value={paymentMode} onChange={e => setPaymentMode(e.target.value)} />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="notes">Admin Notes</Label>
                            <Textarea id="notes" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Optional comments..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>Cancel</Button>
                        <Button onClick={handleComplete} disabled={completeMutation.isPending}>
                            {completeMutation.isPending ? 'Processing...' : 'Confirm & Mark Paid'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Reject Withdrawal</DialogTitle>
                        <DialogDescription>
                            This will refund the amount ({selectedRequest?.requestedAmount}) back to the advisor's balance. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="reason">Rejection Reason *</Label>
                            <Textarea
                                id="reason"
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="Please explain why this request is being rejected..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                            {rejectMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Withdrawals;
