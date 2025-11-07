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
  
  const [levelPrice, setLevelPrice] = useState<string>("");

  const queryClient = useQueryClient();

  // Fetch levels
  const { data: levelsData, error: levelsError } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/api/v1/level");
        console.log("Levels API response in ModalSubscriptionForm:", data);
        return Array.isArray(data?.data) ? data.data : [];
      } catch (error) {
        console.error("Error fetching levels in ModalSubscriptionForm:", error);
        return [];
      }
    },
    onError: (error) => {
      console.error("Levels query error in ModalSubscriptionForm:", error);
    },
  });

  // Fetch modals
  const { data: modalsData, error: modalsError } = useQuery({
    queryKey: ["modals"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/api/v1/modal");
        console.log("Modals API response in ModalSubscriptionForm:", data);
        return Array.isArray(data?.data) ? data.data : [];
      } catch (error) {
        console.error("Error fetching modals in ModalSubscriptionForm:", error);
        return [];
      }
    },
    onError: (error) => {
      console.error("Modals query error in ModalSubscriptionForm:", error);
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

  // Update level price mutation
  const { isLoading: isUpdatingLevelPrice, mutate: updateLevelPrice } = useMutation<
    any,
    Error,
    { levelId: string; price: number }
  >({
    mutationFn: async ({ levelId, price }) => {
      const { data } = await axiosInstance.patch(`/api/v1/level/${levelId}`, { price });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["levels"]);
      queryClient.invalidateQueries(["adminSubscriptions"]);
      toast.success("Level price updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error updating level price");
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
      
      // Set level price if level exists
      if (subscription.level?.price) {
        setLevelPrice(subscription.level.price.toString());
      } else {
        setLevelPrice("");
      }
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

  const handleUpdateLevelPrice = () => {
    if (!formData.level || formData.level === "no-level") {
      toast.error("Please select a level first");
      return;
    }
    
    const price = parseFloat(levelPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    updateLevelPrice({ levelId: formData.level, price });
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
    setLevelPrice("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Subscription Type (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2 mt-6">Subscription Type</label>
            <Select
              value={formData.type.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: parseInt(value) }))}
              disabled
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

          {/* Therapy Modal (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Therapy Type</label>
            <Select
              value={formData.modal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, modal: value }))}
              disabled
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(modalsData) && modalsData.map((modal: IModal) => (
                  <SelectItem key={modal.id} value={modal.id}>
                    {modal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
              disabled
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-level">No Level</SelectItem>
                {Array.isArray(levelsData) && levelsData.map((level: ILevel) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.type} (XP: {level.minXP}-{level.maxXP || "∞"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Level Price</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={levelPrice}
                onChange={(e) => setLevelPrice(e.target.value)}
                placeholder="Enter level price"
                disabled={formData.level === "no-level"}
              />
              <Button
                onClick={handleUpdateLevelPrice}
                disabled={isUpdatingLevelPrice || formData.level === "no-level"}
                size="sm"
              >
                {isUpdatingLevelPrice ? "Updating..." : "Update"}
              </Button>
            </div>
            {formData.level === "no-level" && (
              <p className="text-sm text-muted-foreground mt-1">Select a level to edit its price</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <Input
              type="number"
              value={formData.price || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter price"
            />
          </div>

          {/* Old Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Old Price (Optional)</label>
            <Input
              type="number"
              value={formData.old_price || ""}
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
