import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/public_zone/ui/dialog";
import { Button } from "@/public_zone/ui/button";

interface OfferModalProps {
    property: any;
    isOpen: boolean;
    onClose: () => void;
}

export function OfferModal({ property, isOpen, onClose }: OfferModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>إرسال عرض مالي</DialogTitle>
                    <DialogDescription>
                        قدم عرضك المالي لهذا العقار
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-slate-500 text-center">
                        سيتم تفعيل نموذج إرسال العروض قريباً.
                    </p>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
