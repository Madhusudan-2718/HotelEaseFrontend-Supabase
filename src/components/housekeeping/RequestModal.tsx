import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Upload, X, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  onSubmit: (data: any) => void;
}

export function RequestModal({ isOpen, onClose, serviceType, onSubmit }: RequestModalProps) {
  const [notes, setNotes] = useState("");
  const [schedule, setSchedule] = useState("now");
  const [scheduledTime, setScheduledTime] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Only JPG and PNG files are allowed");
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    const requestData = {
      serviceType,
      notes,
      schedule,
      scheduledTime: schedule === "later" ? scheduledTime : null,
      file: uploadedFile,
      timestamp: new Date().toISOString(),
    };
    
    onSubmit(requestData);
    toast.success("Request submitted successfully!");
    
    // Reset form
    setNotes("");
    setSchedule("now");
    setScheduledTime("");
    setUploadedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request {serviceType}</DialogTitle>
          <DialogDescription>
            Please provide details for your housekeeping request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service-type">Service Type</Label>
            <Select value={serviceType} disabled>
              <SelectTrigger id="service-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={serviceType}>{serviceType}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Please clean the balcony area"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label>When would you like this service?</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSchedule("now")}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  schedule === "now"
                    ? "border-[#6B8E23] bg-[#6B8E23]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Clock className="w-6 h-6 mx-auto mb-2 text-[#6B8E23]" />
                <p className="text-sm">As Soon As Possible</p>
              </button>
              
              <button
                onClick={() => setSchedule("later")}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  schedule === "later"
                    ? "border-[#6B8E23] bg-[#6B8E23]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2 text-[#6B8E23]" />
                <p className="text-sm">Schedule for Later</p>
              </button>
            </div>
          </div>

          {/* Time Picker */}
          {schedule === "later" && (
            <div className="space-y-2">
              <Label htmlFor="scheduled-time">Select Time</Label>
              <input
                type="time"
                id="scheduled-time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8E23]"
              />
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attach Photo (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6B8E23] transition-colors">
              {uploadedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#6B8E23]/10 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-[#6B8E23]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG or PNG (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-gray-900 hover:shadow-lg"
            disabled={schedule === "later" && !scheduledTime}
          >
            Confirm Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
