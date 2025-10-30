import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import axiosInstance from "@/auth/_helpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IAdminSubscription,
  ILevel,
  IModal,
  ISubscriptionUpdatePayload,
  SUBSCRIPTION_TYPES,
} from "@/types/subscription";

interface ModalSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: IAdminSubscription | null;
}

const ModalSubscriptionForm = ({
  isOpen,
  onClose,
  subscription,
}: ModalSubscriptionFormProps) => {
  const [formData, setFormData] = useState({
    type: 0,
    old_price: 0,
    price: 0,
    modal: "",
    level: "no-level"
  });

  const queryClient = useQueryClient();

  // Fetch levels
  const { data: levelsData } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/level");
      return data.data;
    },
  });

  // Fetch modals
  const { data: modalsData } = useQuery({
    queryKey: ["modals"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/modal");
      return data.data;
    },
  });

  // Update subscription mutation
  const { isLoading: isUpdating, mutate: updateSubscription } = useMutation<
    any,
    Error,
    { id: string; payload: ISubscriptionUpdatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const { data } = await axiosInstance.patch(`/api/v1/subscription/admin/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSubscriptions"]);
      toast.success("Subscription updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error updating subscription");
    },
  });

  // Set form data when subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        type: subscription.type,
        old_price: subscription.old_price || 0,
        price: subscription.price,
        modal: subscription.modal.id,
        level: subscription.level?.id || "no-level"
      });
    }
  }, [subscription]);

  const handleSave = () => {
    if (!subscription) return;
    
    const payload: ISubscriptionUpdatePayload = {
      type: formData.type,
      old_price: formData.old_price,
      price: formData.price,
      modal: formData.modal,
      ...(formData.level && formData.level !== "no-level" && { level: formData.level })
    };

    updateSubscription({ id: subscription.id, payload });
  };

  const handleClose = () => {
    onClose();
    // Reset form data
    setFormData({
      type: 0,
      old_price: 0,
      price: 0,
      modal: "",
      level: "no-level"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Subscription Type */}
          <div>
            <label className="block text-sm font-medium mb-2 mt-6">Subscription Type</label>
            <Select
              value={formData.type.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUBSCRIPTION_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Therapy Modal */}
          <div>
            <label className="block text-sm font-medium mb-2">Therapy Type</label>
            <Select
              value={formData.modal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, modal: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modalsData?.map((modal: IModal) => (
                  <SelectItem key={modal.id} value={modal.id}>
                    {modal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-level">No Level</SelectItem>
                {levelsData?.map((level: ILevel) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.type} (XP: {level.minXP}-{level.maxXP || "∞"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter price"
            />
          </div>

          {/* Old Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Old Price (Optional)</label>
            <Input
              type="number"
              value={formData.old_price}
              onChange={(e) => setFormData(prev => ({ ...prev, old_price: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter old price"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ModalSubscriptionForm };
